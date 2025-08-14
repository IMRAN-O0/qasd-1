const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const cron = require('node-cron');
const { database } = require('../config/database');
const logger = require('./logger');
const socketManager = require('./socket');

class BackupManager {
  constructor() {
    this.backupDir = process.env.BACKUP_PATH || './backups';
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 30;
    this.backupSchedule = process.env.BACKUP_SCHEDULE || '0 2 * * *'; // Daily at 2 AM
    this.isBackupRunning = false;
    this.scheduledJob = null;
  }

  async initialize() {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Start scheduled backups
      this.startScheduledBackups();
      
      logger.info('Backup manager initialized', {
        backupDir: this.backupDir,
        maxBackups: this.maxBackups,
        schedule: this.backupSchedule
      });
    } catch (error) {
      logger.logError('Failed to initialize backup manager', {
        error: error.message,
        backupDir: this.backupDir
      });
      throw error;
    }
  }

  startScheduledBackups() {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
    }

    // Schedule automatic backups
    this.scheduledJob = cron.schedule(this.backupSchedule, async () => {
      try {
        logger.info('Starting scheduled backup');
        const result = await this.createBackup('scheduled');
        logger.info('Scheduled backup completed', result);
        
        // Notify admins about successful backup
        socketManager.notifySystemBackup(result);
      } catch (error) {
        logger.logError('Scheduled backup failed', {
          error: error.message,
          stack: error.stack
        });
        
        // Notify admins about backup failure
        socketManager.notifyRole('admin', 'backup_failed', {
          type: 'backup_failed',
          error: error.message,
          timestamp: new Date().toISOString(),
          priority: 'high'
        });
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'UTC'
    });

    logger.info('Scheduled backups started', {
      schedule: this.backupSchedule,
      timezone: process.env.TIMEZONE || 'UTC'
    });
  }

  stopScheduledBackups() {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
      this.scheduledJob = null;
      logger.info('Scheduled backups stopped');
    }
  }

  async createBackup(type = 'manual', description = '') {
    if (this.isBackupRunning) {
      throw new Error('Backup is already in progress');
    }

    this.isBackupRunning = true;
    const startTime = Date.now();

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `qasd_backup_${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.zip`);
      const tempDir = path.join(this.backupDir, 'temp', backupName);

      // Create temporary directory
      await fs.mkdir(tempDir, { recursive: true });

      logger.info('Starting backup creation', {
        backupName: backupName,
        type: type,
        description: description
      });

      // Export database
      const dbBackupPath = await this.exportDatabase(tempDir);
      
      // Export uploaded files
      const filesBackupPath = await this.exportFiles(tempDir);
      
      // Create backup metadata
      const metadata = await this.createBackupMetadata(tempDir, {
        name: backupName,
        type: type,
        description: description,
        timestamp: new Date().toISOString(),
        database_file: path.basename(dbBackupPath),
        files_included: filesBackupPath ? true : false
      });

      // Create ZIP archive
      const archiveSize = await this.createArchive(tempDir, backupPath);

      // Clean up temporary directory
      await this.cleanupTempDir(tempDir);

      // Calculate backup duration
      const duration = Date.now() - startTime;

      // Store backup record in database
      const backupRecord = await this.storeBackupRecord({
        filename: `${backupName}.zip`,
        file_path: backupPath,
        file_size: archiveSize,
        type: type,
        description: description,
        duration: duration
      });

      // Clean up old backups
      await this.cleanupOldBackups();

      const result = {
        id: backupRecord.id,
        filename: `${backupName}.zip`,
        file_path: backupPath,
        file_size: archiveSize,
        file_size_formatted: this.formatFileSize(archiveSize),
        type: type,
        description: description,
        duration: duration,
        duration_formatted: this.formatDuration(duration),
        created_at: backupRecord.created_at
      };

      logger.logBusiness('backup_created', {
        backupId: result.id,
        filename: result.filename,
        fileSize: archiveSize,
        duration: duration,
        type: type
      });

      return result;
    } catch (error) {
      logger.logError('Backup creation failed', {
        error: error.message,
        stack: error.stack,
        type: type
      });
      throw error;
    } finally {
      this.isBackupRunning = false;
    }
  }

  async exportDatabase(tempDir) {
    const dbPath = process.env.DB_PATH || './database.sqlite';
    const backupDbPath = path.join(tempDir, 'database.sqlite');

    try {
      // Copy the SQLite database file
      await fs.copyFile(dbPath, backupDbPath);
      
      logger.info('Database exported successfully', {
        sourcePath: dbPath,
        backupPath: backupDbPath
      });
      
      return backupDbPath;
    } catch (error) {
      logger.logError('Database export failed', {
        error: error.message,
        sourcePath: dbPath,
        backupPath: backupDbPath
      });
      throw new Error(`Failed to export database: ${error.message}`);
    }
  }

  async exportFiles(tempDir) {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const filesBackupDir = path.join(tempDir, 'files');

    try {
      // Check if upload directory exists
      await fs.access(uploadDir);
      
      // Copy files directory
      await this.copyDirectory(uploadDir, filesBackupDir);
      
      logger.info('Files exported successfully', {
        sourcePath: uploadDir,
        backupPath: filesBackupDir
      });
      
      return filesBackupDir;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('Upload directory does not exist, skipping files backup', {
          uploadDir: uploadDir
        });
        return null;
      }
      
      logger.logError('Files export failed', {
        error: error.message,
        sourcePath: uploadDir,
        backupPath: filesBackupDir
      });
      throw new Error(`Failed to export files: ${error.message}`);
    }
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async createBackupMetadata(tempDir, metadata) {
    const metadataPath = path.join(tempDir, 'backup_metadata.json');
    
    // Add system information
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      app_version: process.env.APP_VERSION || '1.0.0',
      backup_version: '1.0'
    };

    // Get database statistics
    const dbStats = await this.getDatabaseStatistics();

    const fullMetadata = {
      ...metadata,
      system: systemInfo,
      database_stats: dbStats
    };

    await fs.writeFile(metadataPath, JSON.stringify(fullMetadata, null, 2));
    
    logger.info('Backup metadata created', {
      metadataPath: metadataPath,
      tableCount: dbStats.table_count,
      totalRecords: dbStats.total_records
    });
    
    return metadataPath;
  }

  async getDatabaseStatistics() {
    try {
      // Get table list and record counts
      const tables = await database.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );

      const stats = {
        table_count: tables.length,
        total_records: 0,
        tables: {}
      };

      for (const table of tables) {
        const result = await database.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        stats.tables[table.name] = result.count;
        stats.total_records += result.count;
      }

      return stats;
    } catch (error) {
      logger.logError('Failed to get database statistics', {
        error: error.message
      });
      return {
        table_count: 0,
        total_records: 0,
        tables: {},
        error: error.message
      };
    }
  }

  async createArchive(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      let totalSize = 0;

      output.on('close', () => {
        totalSize = archive.pointer();
        logger.info('Archive created successfully', {
          outputPath: outputPath,
          totalSize: totalSize,
          totalSizeFormatted: this.formatFileSize(totalSize)
        });
        resolve(totalSize);
      });

      archive.on('error', (err) => {
        logger.logError('Archive creation failed', {
          error: err.message,
          outputPath: outputPath
        });
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async cleanupTempDir(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      logger.info('Temporary directory cleaned up', {
        tempDir: tempDir
      });
    } catch (error) {
      logger.logError('Failed to cleanup temporary directory', {
        error: error.message,
        tempDir: tempDir
      });
    }
  }

  async storeBackupRecord(backupData) {
    const result = await database.run(
      `INSERT INTO backups 
       (filename, file_path, file_size, type, description, duration)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        backupData.filename,
        backupData.file_path,
        backupData.file_size,
        backupData.type,
        backupData.description,
        backupData.duration
      ]
    );

    return await database.get(
      'SELECT * FROM backups WHERE id = ?',
      [result.id]
    );
  }

  async cleanupOldBackups() {
    try {
      // Get old backups to delete
      const oldBackups = await database.all(
        `SELECT * FROM backups 
         ORDER BY created_at DESC 
         LIMIT -1 OFFSET ?`,
        [this.maxBackups]
      );

      for (const backup of oldBackups) {
        try {
          // Delete file from disk
          await fs.unlink(backup.file_path);
          
          // Delete record from database
          await database.run('DELETE FROM backups WHERE id = ?', [backup.id]);
          
          logger.info('Old backup deleted', {
            backupId: backup.id,
            filename: backup.filename
          });
        } catch (error) {
          logger.logError('Failed to delete old backup', {
            error: error.message,
            backupId: backup.id,
            filename: backup.filename
          });
        }
      }

      if (oldBackups.length > 0) {
        logger.info('Old backups cleanup completed', {
          deletedCount: oldBackups.length
        });
      }
    } catch (error) {
      logger.logError('Failed to cleanup old backups', {
        error: error.message
      });
    }
  }

  async getBackupList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Get total count
    const { total } = await database.get('SELECT COUNT(*) as total FROM backups');
    
    // Get backups
    const backups = await database.all(
      `SELECT * FROM backups 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Add formatted sizes and check file existence
    const formattedBackups = await Promise.all(
      backups.map(async (backup) => {
        let fileExists = false;
        try {
          await fs.access(backup.file_path);
          fileExists = true;
        } catch (error) {
          // File doesn't exist
        }

        return {
          ...backup,
          file_size_formatted: this.formatFileSize(backup.file_size),
          duration_formatted: this.formatDuration(backup.duration),
          file_exists: fileExists
        };
      })
    );

    return {
      backups: formattedBackups,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getBackupById(id) {
    const backup = await database.get(
      'SELECT * FROM backups WHERE id = ?',
      [id]
    );

    if (!backup) {
      return null;
    }

    // Check if file exists
    let fileExists = false;
    try {
      await fs.access(backup.file_path);
      fileExists = true;
    } catch (error) {
      // File doesn't exist
    }

    return {
      ...backup,
      file_size_formatted: this.formatFileSize(backup.file_size),
      duration_formatted: this.formatDuration(backup.duration),
      file_exists: fileExists
    };
  }

  async deleteBackup(id) {
    const backup = await this.getBackupById(id);
    
    if (!backup) {
      throw new Error('Backup not found');
    }

    // Delete file from disk
    try {
      await fs.unlink(backup.file_path);
    } catch (error) {
      logger.logError('Failed to delete backup file from disk', {
        error: error.message,
        backupId: id,
        filePath: backup.file_path
      });
      // Continue with database deletion even if file deletion fails
    }

    // Delete record from database
    await database.run('DELETE FROM backups WHERE id = ?', [id]);

    logger.logBusiness('backup_deleted', {
      backupId: id,
      filename: backup.filename
    });

    return true;
  }

  async getBackupStatistics() {
    const stats = await database.get(
      `SELECT 
         COUNT(*) as total_backups,
         SUM(file_size) as total_size,
         AVG(file_size) as avg_size,
         AVG(duration) as avg_duration,
         MIN(created_at) as oldest_backup,
         MAX(created_at) as latest_backup
       FROM backups`
    );

    const typeStats = await database.all(
      `SELECT 
         type,
         COUNT(*) as count,
         SUM(file_size) as total_size,
         AVG(duration) as avg_duration
       FROM backups
       GROUP BY type
       ORDER BY count DESC`
    );

    return {
      overall: {
        ...stats,
        total_size_formatted: this.formatFileSize(stats.total_size || 0),
        avg_size_formatted: this.formatFileSize(stats.avg_size || 0),
        avg_duration_formatted: this.formatDuration(stats.avg_duration || 0)
      },
      by_type: typeStats.map(stat => ({
        ...stat,
        total_size_formatted: this.formatFileSize(stat.total_size),
        avg_duration_formatted: this.formatDuration(stat.avg_duration)
      })),
      schedule: {
        enabled: this.scheduledJob ? true : false,
        schedule: this.backupSchedule,
        next_run: this.scheduledJob ? this.scheduledJob.nextDate() : null
      }
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }

  // Get backup status
  getStatus() {
    return {
      is_running: this.isBackupRunning,
      scheduled_enabled: this.scheduledJob ? true : false,
      schedule: this.backupSchedule,
      backup_dir: this.backupDir,
      max_backups: this.maxBackups,
      next_scheduled_run: this.scheduledJob ? this.scheduledJob.nextDate() : null
    };
  }
}

// Create singleton instance
const backupManager = new BackupManager();

module.exports = backupManager;