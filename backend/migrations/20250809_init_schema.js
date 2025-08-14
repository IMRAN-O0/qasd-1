/**
 * Initial schema migration for MySQL using Knex
 * Note: This is a minimal viable subset to get the app running.
 * You can extend types/indexes as needed.
 */

exports.up = async function(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('username', 50).notNullable().unique();
      table.string('email', 100).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('role', 20).defaultTo('user');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  const hasCustomers = await knex.schema.hasTable('customers');
  if (!hasCustomers) {
    await knex.schema.createTable('customers', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 20).notNullable().unique();
      table.string('contact_person', 100);
      table.string('phone', 20);
      table.string('email', 100);
      table.text('address');
      table.string('city', 50);
      table.string('country', 50).defaultTo('Saudi Arabia');
      table.decimal('credit_limit', 15, 2).defaultTo(0);
      table.integer('payment_terms').defaultTo(30);
      table.string('vat_number', 20);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  const hasProducts = await knex.schema.hasTable('products');
  if (!hasProducts) {
    await knex.schema.createTable('products', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 20).notNullable().unique();
      table.string('category', 50);
      table.text('description');
      table.string('unit', 20).defaultTo('piece');
      table.decimal('price', 15, 2).notNullable();
      table.decimal('cost', 15, 2);
      table.integer('stock_quantity').defaultTo(0);
      table.integer('min_stock_level').defaultTo(0);
      table.integer('max_stock_level');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  const hasInvoices = await knex.schema.hasTable('invoices');
  if (!hasInvoices) {
    await knex.schema.createTable('invoices', table => {
      table.increments('id').primary();
      table.string('number', 20).notNullable().unique();
      table.integer('customer_id').unsigned().notNullable();
      table.integer('quotation_id').unsigned();
      table.date('date').notNullable();
      table.date('due_date');
      table.decimal('subtotal', 15, 2).notNullable();
      table.decimal('tax_amount', 15, 2).defaultTo(0);
      table.decimal('discount_amount', 15, 2).defaultTo(0);
      table.decimal('total', 15, 2).notNullable();
      table.decimal('paid_amount', 15, 2).defaultTo(0);
      table.string('payment_status', 20).defaultTo('pending');
      table.string('status', 20).defaultTo('draft');
      table.text('notes');
      table.integer('created_by').unsigned();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('customer_id').references('id').inTable('customers');
      // table.foreign('quotation_id').references('id').inTable('quotations');
      table.foreign('created_by').references('id').inTable('users');
    });
  }

  const hasFiles = await knex.schema.hasTable('files');
  if (!hasFiles) {
    await knex.schema.createTable('files', table => {
      table.increments('id').primary();
      table.text('original_name').notNullable();
      table.text('filename').notNullable();
      table.text('file_path').notNullable();
      table.integer('file_size').notNullable();
      table.text('mime_type').notNullable();
      table.text('file_hash');
      table.text('category').defaultTo('general');
      table.text('description');
      table.text('entity_type');
      table.integer('entity_id');
      table.integer('download_count').defaultTo(0);
      table.integer('uploaded_by').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('last_downloaded');

      table.foreign('uploaded_by').references('id').inTable('users');
    });
  }

  // Basic indexes (guarded to avoid duplicates on MySQL/SQLite)
  const client = (knex.client && knex.client.config && knex.client.config.client) || '';
  const isMySQL = client === 'mysql2';
  const isSQLite = client === 'sqlite3';
  const ensureIndex = async (table, indexName, columns) => {
    if (isMySQL) {
      const [rows] = await knex.raw(
        'SELECT COUNT(1) as cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?',
        [table, indexName]
      );
      const cnt = Array.isArray(rows) ? (rows[0] && (rows[0].cnt || rows[0].CNT)) : (rows && (rows.cnt || rows.CNT));
      const exists = Number(cnt) > 0;
      if (!exists) {
        const cols = columns.map(c => `\`${c}\``).join(',');
        await knex.raw(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${cols})`);
      }
    } else if (isSQLite) {
      // Check sqlite index existence
      const info = await knex.raw(`PRAGMA index_list('${table}')`);
      const indexes = Array.isArray(info) ? info : [];
      const exists = indexes.some(i => (i.name || i.Name || i.index_name) === indexName);
      if (!exists) {
        await knex.schema.alterTable(table, t => t.index(columns, indexName));
      }
    } else {
      await knex.schema.alterTable(table, t => t.index(columns, indexName));
    }
  };

  await ensureIndex('users', 'users_username_index', ['username']);
  await ensureIndex('users', 'users_email_index', ['email']);
  await ensureIndex('customers', 'customers_code_index', ['code']);
  await ensureIndex('products', 'products_code_index', ['code']);
  await ensureIndex('invoices', 'invoices_number_index', ['number']);
  await ensureIndex('invoices', 'invoices_customer_id_index', ['customer_id']);
  // Skip indexing TEXT column without length on MySQL
  if (!isMySQL) { await ensureIndex('files', 'files_file_hash_index', ['file_hash']); }
  if (!isMySQL) { await ensureIndex('files', 'files_category_index', ['category']); }
  if (!isMySQL) { await ensureIndex('files', 'files_entity_type_entity_id_index', ['entity_type', 'entity_id']); }
  await ensureIndex('files', 'files_uploaded_by_index', ['uploaded_by']);
  await ensureIndex('files', 'files_created_at_index', ['created_at']);
};

exports.down = async function(knex) {
  // Drop tables in reverse order to satisfy FKs
  const tables = ['files', 'invoices', 'products', 'customers', 'users'];
  for (const name of tables) {
    const exists = await knex.schema.hasTable(name);
    if (exists) {
      await knex.schema.dropTable(name);
    }
  }
};

