#!/bin/bash
# Backup Script for QASD Application
# Handles automated backups, restoration, and disaster recovery

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_BASE_DIR="/opt/qasd/backups"
LOG_FILE="/var/log/qasd-backup.log"
CONFIG_FILE="$PROJECT_DIR/.backup.conf"

# Default values
BACKUP_TYPE="full"
RETENTION_DAYS="30"
COMPRESSION="gzip"
ENCRYPTION="false"
REMOTE_BACKUP="false"
NOTIFICATION="false"
VERIFY_BACKUP="true"
QUIET_MODE="false"

# Remote backup settings
REMOTE_TYPE=""  # s3, ftp, rsync
REMOTE_HOST=""
REMOTE_PATH=""
REMOTE_USER=""
REMOTE_KEY=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    if [ "$QUIET_MODE" != "true" ]; then
        echo -e "${BLUE}INFO:${NC} $message"
    fi
    echo "INFO: $message" >> "$LOG_FILE"
}

warn() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${YELLOW}WARN:${NC} $message"
    echo "WARNING: $message" >> "$LOG_FILE"
}

error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${RED}ERROR:${NC} $message"
    echo "ERROR: $message" >> "$LOG_FILE"
}

success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    if [ "$QUIET_MODE" != "true" ]; then
        echo -e "${GREEN}SUCCESS:${NC} $message"
    fi
    echo "SUCCESS: $message" >> "$LOG_FILE"
}

step() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    if [ "$QUIET_MODE" != "true" ]; then
        echo -e "${PURPLE}STEP:${NC} $message"
    fi
    echo "STEP: $message" >> "$LOG_FILE"
}

# Error handling
error_exit() {
    error "$1"
    send_notification "FAILED" "Backup failed: $1"
    exit 1
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

QASD Backup Management Script

COMMANDS:
    backup                Create a new backup
    restore               Restore from backup
    list                  List available backups
    cleanup               Clean up old backups
    verify                Verify backup integrity
    schedule              Setup automated backup schedule

OPTIONS:
    -t, --type TYPE       Backup type (full, incremental, differential) [default: full]
    -d, --destination DIR Backup destination directory
    -r, --retention DAYS  Retention period in days [default: 30]
    -c, --compress TYPE   Compression type (gzip, bzip2, xz) [default: gzip]
    -e, --encrypt         Enable encryption
    --remote              Enable remote backup
    --remote-type TYPE    Remote backup type (s3, ftp, rsync)
    --remote-host HOST    Remote host
    --remote-path PATH    Remote path
    --remote-user USER    Remote user
    --remote-key KEY      Remote key/password
    -n, --notify          Enable notifications
    --no-verify           Skip backup verification
    -q, --quiet           Quiet mode
    -h, --help            Show this help message

EXAMPLES:
    $0 backup                                    # Create full backup
    $0 backup -t incremental                     # Create incremental backup
    $0 restore backup_20231201_120000            # Restore specific backup
    $0 list                                      # List all backups
    $0 cleanup -r 7                             # Clean backups older than 7 days
    $0 schedule                                  # Setup automated backups

EOF
}

# Function to parse command line arguments
parse_arguments() {
    COMMAND="$1"
    shift
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                BACKUP_TYPE="$2"
                shift 2
                ;;
            -d|--destination)
                BACKUP_BASE_DIR="$2"
                shift 2
                ;;
            -r|--retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            -c|--compress)
                COMPRESSION="$2"
                shift 2
                ;;
            -e|--encrypt)
                ENCRYPTION="true"
                shift
                ;;
            --remote)
                REMOTE_BACKUP="true"
                shift
                ;;
            --remote-type)
                REMOTE_TYPE="$2"
                shift 2
                ;;
            --remote-host)
                REMOTE_HOST="$2"
                shift 2
                ;;
            --remote-path)
                REMOTE_PATH="$2"
                shift 2
                ;;
            --remote-user)
                REMOTE_USER="$2"
                shift 2
                ;;
            --remote-key)
                REMOTE_KEY="$2"
                shift 2
                ;;
            -n|--notify)
                NOTIFICATION="true"
                shift
                ;;
            --no-verify)
                VERIFY_BACKUP="false"
                shift
                ;;
            -q|--quiet)
                QUIET_MODE="true"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                if [ -z "${BACKUP_NAME:-}" ]; then
                    BACKUP_NAME="$1"
                else
                    error "Unknown option: $1"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
}

# Function to load configuration
load_configuration() {
    if [ -f "$CONFIG_FILE" ]; then
        log "Loading configuration from $CONFIG_FILE"
        source "$CONFIG_FILE"
    fi
}

# Function to validate prerequisites
validate_prerequisites() {
    step "Validating backup prerequisites"
    
    # Check required tools
    local required_tools=("tar" "date" "find")
    
    case "$COMPRESSION" in
        "gzip")
            required_tools+=("gzip")
            ;;
        "bzip2")
            required_tools+=("bzip2")
            ;;
        "xz")
            required_tools+=("xz")
            ;;
    esac
    
    if [ "$ENCRYPTION" = "true" ]; then
        required_tools+=("gpg")
    fi
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" > /dev/null 2>&1; then
            error_exit "Required tool not found: $tool"
        fi
    done
    
    # Check backup directory
    if [ ! -d "$BACKUP_BASE_DIR" ]; then
        log "Creating backup directory: $BACKUP_BASE_DIR"
        mkdir -p "$BACKUP_BASE_DIR" || error_exit "Failed to create backup directory"
    fi
    
    # Check disk space
    local available_space=$(df "$BACKUP_BASE_DIR" | awk 'NR==2 {print $4}')
    local min_space=1048576  # 1GB in KB
    
    if [ "$available_space" -lt "$min_space" ]; then
        error_exit "Insufficient disk space. Available: $(($available_space/1024/1024))GB, Required: 1GB"
    fi
    
    success "Prerequisites validation completed"
}

# Function to create backup
create_backup() {
    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="qasd_${BACKUP_TYPE}_${backup_timestamp}"
    local backup_dir="$BACKUP_BASE_DIR/$backup_name"
    local backup_file="$backup_dir.tar"
    
    step "Creating $BACKUP_TYPE backup: $backup_name"
    
    # Create temporary backup directory
    mkdir -p "$backup_dir"
    
    # Create backup metadata
    create_backup_metadata "$backup_dir" "$backup_name"
    
    # Backup application files
    backup_application_files "$backup_dir"
    
    # Backup configuration files
    backup_configuration_files "$backup_dir"
    
    # Backup Docker volumes (if applicable)
    backup_docker_volumes "$backup_dir"
    
    # Backup database (if applicable)
    backup_database "$backup_dir"
    
    # Create tar archive
    create_archive "$backup_dir" "$backup_file"
    
    # Compress archive
    compress_archive "$backup_file"
    
    # Encrypt archive (if enabled)
    if [ "$ENCRYPTION" = "true" ]; then
        encrypt_archive "$backup_file"
    fi
    
    # Verify backup
    if [ "$VERIFY_BACKUP" = "true" ]; then
        verify_backup_integrity "$backup_file"
    fi
    
    # Upload to remote (if enabled)
    if [ "$REMOTE_BACKUP" = "true" ]; then
        upload_to_remote "$backup_file"
    fi
    
    # Cleanup temporary directory
    rm -rf "$backup_dir"
    
    success "Backup created successfully: $backup_file"
    
    # Send notification
    send_notification "SUCCESS" "Backup completed successfully: $backup_name"
    
    echo "$backup_file"
}

# Function to create backup metadata
create_backup_metadata() {
    local backup_dir="$1"
    local backup_name="$2"
    
    log "Creating backup metadata"
    
    cat > "$backup_dir/backup.meta" << EOF
Backup Name: $backup_name
Backup Type: $BACKUP_TYPE
Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Hostname: $(hostname)
User: $(whoami)
Script Version: 1.0.0
Compression: $COMPRESSION
Encryption: $ENCRYPTION
Application Version: $(cat "$PROJECT_DIR/package.json" | grep '"version"' | cut -d'"' -f4 2>/dev/null || echo "unknown")
Git Commit: $(cd "$PROJECT_DIR" && git rev-parse HEAD 2>/dev/null || echo "unknown")
Git Branch: $(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "unknown")
EOF
    
    # Create file list
    log "Creating file inventory"
    find "$PROJECT_DIR" -type f -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" | \
        sed "s|$PROJECT_DIR/||" > "$backup_dir/file_list.txt"
}

# Function to backup application files
backup_application_files() {
    local backup_dir="$1"
    
    log "Backing up application files"
    
    # Create application backup directory
    mkdir -p "$backup_dir/application"
    
    # Copy source code
    if [ -d "$PROJECT_DIR/src" ]; then
        cp -r "$PROJECT_DIR/src" "$backup_dir/application/"
    fi
    
    # Copy public files
    if [ -d "$PROJECT_DIR/public" ]; then
        cp -r "$PROJECT_DIR/public" "$backup_dir/application/"
    fi
    
    # Copy build files (if exists)
    if [ -d "$PROJECT_DIR/build" ]; then
        cp -r "$PROJECT_DIR/build" "$backup_dir/application/"
    fi
    
    # Copy package files
    for file in package.json package-lock.json yarn.lock; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            cp "$PROJECT_DIR/$file" "$backup_dir/application/"
        fi
    done
}

# Function to backup configuration files
backup_configuration_files() {
    local backup_dir="$1"
    
    log "Backing up configuration files"
    
    # Create configuration backup directory
    mkdir -p "$backup_dir/config"
    
    # Copy configuration files
    for file in .env .env.production .env.staging docker-compose.yml docker-compose.prod.yml Dockerfile Dockerfile.prod; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            cp "$PROJECT_DIR/$file" "$backup_dir/config/"
        fi
    done
    
    # Copy config directory
    if [ -d "$PROJECT_DIR/config" ]; then
        cp -r "$PROJECT_DIR/config" "$backup_dir/"
    fi
    
    # Copy scripts
    if [ -d "$PROJECT_DIR/scripts" ]; then
        cp -r "$PROJECT_DIR/scripts" "$backup_dir/"
    fi
}

# Function to backup Docker volumes
backup_docker_volumes() {
    local backup_dir="$1"
    
    if ! command -v docker > /dev/null 2>&1; then
        log "Docker not available, skipping volume backup"
        return 0
    fi
    
    log "Backing up Docker volumes"
    
    # Create volumes backup directory
    mkdir -p "$backup_dir/volumes"
    
    # Get list of QASD-related volumes
    local volumes=$(docker volume ls --filter name=qasd --format "{{.Name}}" 2>/dev/null || true)
    
    if [ -n "$volumes" ]; then
        for volume in $volumes; do
            log "Backing up volume: $volume"
            docker run --rm -v "$volume":/data -v "$backup_dir/volumes":/backup alpine \
                tar czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null || \
                warn "Failed to backup volume: $volume"
        done
    else
        log "No QASD volumes found"
    fi
}

# Function to backup database
backup_database() {
    local backup_dir="$1"
    
    # Check if database backup is configured
    if [ -z "${DB_HOST:-}" ] && [ -z "${DATABASE_URL:-}" ]; then
        log "No database configuration found, skipping database backup"
        return 0
    fi
    
    log "Backing up database"
    
    # Create database backup directory
    mkdir -p "$backup_dir/database"
    
    # PostgreSQL backup
    if [ -n "${DB_HOST:-}" ] && [ "${DB_TYPE:-}" = "postgresql" ]; then
        log "Creating PostgreSQL backup"
        PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-qasd}" \
            -d "${DB_NAME:-qasd}" \
            --no-password \
            --verbose \
            > "$backup_dir/database/postgresql_dump.sql" 2>/dev/null || \
            warn "Failed to create PostgreSQL backup"
    fi
    
    # MongoDB backup
    if [ -n "${MONGO_URL:-}" ]; then
        log "Creating MongoDB backup"
        mongodump --uri="${MONGO_URL}" --out="$backup_dir/database/mongodb" 2>/dev/null || \
            warn "Failed to create MongoDB backup"
    fi
}

# Function to create tar archive
create_archive() {
    local backup_dir="$1"
    local backup_file="$2"
    
    log "Creating tar archive"
    
    tar -cf "$backup_file" -C "$(dirname "$backup_dir")" "$(basename "$backup_dir")" || \
        error_exit "Failed to create tar archive"
}

# Function to compress archive
compress_archive() {
    local backup_file="$1"
    
    log "Compressing archive with $COMPRESSION"
    
    case "$COMPRESSION" in
        "gzip")
            gzip "$backup_file" || error_exit "Failed to compress with gzip"
            echo "${backup_file}.gz"
            ;;
        "bzip2")
            bzip2 "$backup_file" || error_exit "Failed to compress with bzip2"
            echo "${backup_file}.bz2"
            ;;
        "xz")
            xz "$backup_file" || error_exit "Failed to compress with xz"
            echo "${backup_file}.xz"
            ;;
        *)
            echo "$backup_file"
            ;;
    esac
}

# Function to encrypt archive
encrypt_archive() {
    local backup_file="$1"
    
    log "Encrypting archive"
    
    if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
        error_exit "Encryption enabled but BACKUP_ENCRYPTION_KEY not set"
    fi
    
    gpg --symmetric --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
        --s2k-digest-algo SHA512 --s2k-count 65536 --force-mdc \
        --passphrase "$BACKUP_ENCRYPTION_KEY" \
        --batch --yes "$backup_file" || error_exit "Failed to encrypt archive"
    
    rm -f "$backup_file"
    echo "${backup_file}.gpg"
}

# Function to verify backup integrity
verify_backup_integrity() {
    local backup_file="$1"
    
    log "Verifying backup integrity"
    
    # Check if file exists and is readable
    if [ ! -r "$backup_file" ]; then
        error_exit "Backup file is not readable: $backup_file"
    fi
    
    # Verify archive integrity based on compression
    case "$backup_file" in
        *.tar.gz)
            gzip -t "$backup_file" || error_exit "Backup file is corrupted"
            ;;
        *.tar.bz2)
            bzip2 -t "$backup_file" || error_exit "Backup file is corrupted"
            ;;
        *.tar.xz)
            xz -t "$backup_file" || error_exit "Backup file is corrupted"
            ;;
        *.tar)
            tar -tf "$backup_file" > /dev/null || error_exit "Backup file is corrupted"
            ;;
    esac
    
    success "Backup integrity verified"
}

# Function to upload to remote
upload_to_remote() {
    local backup_file="$1"
    
    if [ "$REMOTE_BACKUP" != "true" ]; then
        return 0
    fi
    
    log "Uploading backup to remote storage"
    
    case "$REMOTE_TYPE" in
        "s3")
            upload_to_s3 "$backup_file"
            ;;
        "ftp")
            upload_to_ftp "$backup_file"
            ;;
        "rsync")
            upload_to_rsync "$backup_file"
            ;;
        *)
            error_exit "Unknown remote backup type: $REMOTE_TYPE"
            ;;
    esac
}

# Function to upload to S3
upload_to_s3() {
    local backup_file="$1"
    
    if ! command -v aws > /dev/null 2>&1; then
        error_exit "AWS CLI not found for S3 upload"
    fi
    
    aws s3 cp "$backup_file" "s3://${REMOTE_HOST}${REMOTE_PATH}/$(basename "$backup_file")" || \
        error_exit "Failed to upload to S3"
    
    success "Backup uploaded to S3"
}

# Function to upload via FTP
upload_to_ftp() {
    local backup_file="$1"
    
    if ! command -v ftp > /dev/null 2>&1; then
        error_exit "FTP client not found"
    fi
    
    ftp -n "$REMOTE_HOST" << EOF
user $REMOTE_USER $REMOTE_KEY
binary
cd $REMOTE_PATH
put $backup_file
quit
EOF
    
    success "Backup uploaded via FTP"
}

# Function to upload via rsync
upload_to_rsync() {
    local backup_file="$1"
    
    if ! command -v rsync > /dev/null 2>&1; then
        error_exit "rsync not found"
    fi
    
    rsync -avz "$backup_file" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || \
        error_exit "Failed to upload via rsync"
    
    success "Backup uploaded via rsync"
}

# Function to list backups
list_backups() {
    step "Listing available backups"
    
    if [ ! -d "$BACKUP_BASE_DIR" ]; then
        log "No backup directory found: $BACKUP_BASE_DIR"
        return 0
    fi
    
    local backups=$(find "$BACKUP_BASE_DIR" -name "qasd_*" -type f | sort -r)
    
    if [ -z "$backups" ]; then
        log "No backups found"
        return 0
    fi
    
    echo "Available backups:"
    echo "=================="
    
    for backup in $backups; do
        local backup_name=$(basename "$backup")
        local backup_size=$(du -h "$backup" | cut -f1)
        local backup_date=$(stat -c %y "$backup" 2>/dev/null || stat -f %Sm "$backup" 2>/dev/null || echo "unknown")
        
        printf "%-50s %10s %s\n" "$backup_name" "$backup_size" "$backup_date"
    done
}

# Function to cleanup old backups
cleanup_backups() {
    step "Cleaning up old backups (retention: $RETENTION_DAYS days)"
    
    if [ ! -d "$BACKUP_BASE_DIR" ]; then
        log "No backup directory found: $BACKUP_BASE_DIR"
        return 0
    fi
    
    local old_backups=$(find "$BACKUP_BASE_DIR" -name "qasd_*" -type f -mtime +"$RETENTION_DAYS")
    
    if [ -z "$old_backups" ]; then
        log "No old backups to clean up"
        return 0
    fi
    
    local count=0
    for backup in $old_backups; do
        log "Removing old backup: $(basename "$backup")"
        rm -f "$backup"
        count=$((count + 1))
    done
    
    success "Cleaned up $count old backups"
}

# Function to restore backup
restore_backup() {
    local backup_name="$1"
    
    if [ -z "$backup_name" ]; then
        error_exit "Backup name not specified"
    fi
    
    step "Restoring backup: $backup_name"
    
    # Find backup file
    local backup_file=$(find "$BACKUP_BASE_DIR" -name "*$backup_name*" -type f | head -1)
    
    if [ -z "$backup_file" ]; then
        error_exit "Backup not found: $backup_name"
    fi
    
    log "Found backup file: $backup_file"
    
    # Create restore directory
    local restore_dir="/tmp/qasd_restore_$(date +%s)"
    mkdir -p "$restore_dir"
    
    # Extract backup
    extract_backup "$backup_file" "$restore_dir"
    
    # Restore files
    restore_files "$restore_dir"
    
    # Cleanup
    rm -rf "$restore_dir"
    
    success "Backup restored successfully"
}

# Function to extract backup
extract_backup() {
    local backup_file="$1"
    local restore_dir="$2"
    
    log "Extracting backup"
    
    case "$backup_file" in
        *.tar.gz)
            tar -xzf "$backup_file" -C "$restore_dir"
            ;;
        *.tar.bz2)
            tar -xjf "$backup_file" -C "$restore_dir"
            ;;
        *.tar.xz)
            tar -xJf "$backup_file" -C "$restore_dir"
            ;;
        *.tar)
            tar -xf "$backup_file" -C "$restore_dir"
            ;;
        *.gpg)
            if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
                error_exit "Encrypted backup but BACKUP_ENCRYPTION_KEY not set"
            fi
            gpg --decrypt --passphrase "$BACKUP_ENCRYPTION_KEY" --batch --yes "$backup_file" | \
                tar -xz -C "$restore_dir"
            ;;
        *)
            error_exit "Unknown backup format: $backup_file"
            ;;
    esac
}

# Function to restore files
restore_files() {
    local restore_dir="$1"
    
    log "Restoring application files"
    
    # Find the extracted backup directory
    local backup_content=$(find "$restore_dir" -name "qasd_*" -type d | head -1)
    
    if [ -z "$backup_content" ]; then
        error_exit "Backup content not found in restore directory"
    fi
    
    # Restore application files
    if [ -d "$backup_content/application" ]; then
        log "Restoring application files"
        cp -r "$backup_content/application/"* "$PROJECT_DIR/"
    fi
    
    # Restore configuration files
    if [ -d "$backup_content/config" ]; then
        log "Restoring configuration files"
        cp -r "$backup_content/config/"* "$PROJECT_DIR/"
    fi
    
    success "Files restored successfully"
}

# Function to setup automated backup schedule
setup_schedule() {
    step "Setting up automated backup schedule"
    
    # Create cron job
    local cron_job="0 2 * * * $SCRIPT_DIR/backup.sh backup -q"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
    
    success "Automated backup scheduled for 2:00 AM daily"
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    if [ "$NOTIFICATION" != "true" ]; then
        return 0
    fi
    
    # Send email notification (if configured)
    if [ -n "${NOTIFICATION_EMAIL:-}" ]; then
        echo "$message" | mail -s "QASD Backup $status" "$NOTIFICATION_EMAIL" 2>/dev/null || true
    fi
    
    # Send webhook notification (if configured)
    if [ -n "${NOTIFICATION_WEBHOOK:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\": \"QASD Backup $status: $message\"}" \
            "$NOTIFICATION_WEBHOOK" 2>/dev/null || true
    fi
}

# Main function
main() {
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Load configuration
    load_configuration
    
    # Parse arguments
    parse_arguments "$@"
    
    # Validate command
    case "$COMMAND" in
        "backup")
            validate_prerequisites
            create_backup
            cleanup_backups
            ;;
        "restore")
            restore_backup "$BACKUP_NAME"
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            cleanup_backups
            ;;
        "verify")
            if [ -n "$BACKUP_NAME" ]; then
                local backup_file=$(find "$BACKUP_BASE_DIR" -name "*$BACKUP_NAME*" -type f | head -1)
                if [ -n "$backup_file" ]; then
                    verify_backup_integrity "$backup_file"
                else
                    error_exit "Backup not found: $BACKUP_NAME"
                fi
            else
                error_exit "Backup name not specified for verification"
            fi
            ;;
        "schedule")
            setup_schedule
            ;;
        "")
            error "No command specified"
            show_usage
            exit 1
            ;;
        *)
            error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"