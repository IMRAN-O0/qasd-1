/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Skip this legacy SQLite-oriented migration when using MySQL to avoid duplicate keys/errors
  if ((knex.client && knex.client.config && knex.client.config.client) === 'mysql2') {
    return Promise.resolve();
  }

  return knex.schema
    // Users table
    .createTableIfNotExists('users', function(table) {
      table.increments('id').primary();
      table.string('username', 50).notNullable();
      table.string('email', 100).notNullable();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 50);
      table.string('last_name', 50);
      table.enum('role', ['admin', 'manager', 'supervisor', 'user']).defaultTo('user');
      table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_login');
      table.timestamps(true, true);


    })

    // Products table
    // If table exists, skip to avoid duplicate keys in MySQL
    // eslint-disable-next-line no-unused-vars
    .createTable('products', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 50).notNullable();
      table.text('description');
      table.string('category', 50);
      table.decimal('price', 10, 2);
      table.string('unit', 20).defaultTo('pcs');
      table.integer('stock_quantity').defaultTo(0);
      table.integer('min_stock_level').defaultTo(0);
      table.enum('status', ['active', 'inactive', 'discontinued']).defaultTo('active');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);


    })

    // Materials table
    // If table exists, skip to avoid duplicate keys in MySQL
    // eslint-disable-next-line no-unused-vars
    .createTable('materials', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 50).notNullable().unique();
      table.text('description');
      table.string('category', 50);
      table.string('unit', 20).defaultTo('kg');
      table.decimal('cost_per_unit', 10, 2);
      table.integer('stock_quantity').defaultTo(0);
      table.integer('min_stock_level').defaultTo(0);
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);


    })

    // Equipment table
    // If table exists, skip to avoid duplicate keys in MySQL
    // eslint-disable-next-line no-unused-vars
    .createTable('equipment', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 50).notNullable();
      table.string('type', 50);
      table.text('description');
      table.decimal('capacity', 10, 2);
      table.string('location', 100);
      table.date('purchase_date');
      table.decimal('purchase_cost', 12, 2);
      table.text('maintenance_schedule');
      table.enum('status', ['active', 'maintenance', 'inactive']).defaultTo('active');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);


    })

    // Production batches table
    .createTableIfNotExists('production_batches', function(table) {
      table.increments('id').primary();
      table.string('number', 50).notNullable();
      table.integer('product_id').unsigned().notNullable();
      table.decimal('planned_quantity', 10, 2).notNullable();
      table.decimal('actual_quantity', 10, 2).defaultTo(0);
      table.enum('status', ['planned', 'in_progress', 'completed', 'cancelled']).defaultTo('planned');
      table.datetime('start_date').notNullable();
      table.datetime('expected_end_date');
      table.datetime('actual_end_date');
      table.integer('equipment_id').unsigned();
      table.integer('created_by').unsigned().notNullable();
      table.text('notes');
      table.timestamps(true, true);

      table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
      table.foreign('equipment_id').references('id').inTable('equipment').onDelete('SET NULL');
      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT');


    })

    // Batch materials table (junction table)
    .createTableIfNotExists('batch_materials', function(table) {
      table.increments('id').primary();
      table.integer('batch_id').unsigned().notNullable();
      table.integer('material_id').unsigned().notNullable();
      table.decimal('quantity_required', 10, 2).notNullable();
      table.decimal('quantity_used', 10, 2).defaultTo(0);
      table.timestamps(true, true);

      table.foreign('batch_id').references('id').inTable('production_batches').onDelete('CASCADE');
      table.foreign('material_id').references('id').inTable('materials').onDelete('RESTRICT');

      table.unique(['batch_id', 'material_id']);
      table.index(['batch_id']);
      table.index(['material_id']);
    })

    // Quality checks table
    .createTableIfNotExists('quality_checks', function(table) {
      table.increments('id').primary();
      table.integer('batch_id').unsigned().notNullable();
      table.string('check_type', 50).notNullable();
      table.enum('result', ['pass', 'fail', 'conditional']).notNullable();
      table.decimal('checked_quantity', 10, 2);
      table.text('notes');
      table.integer('checked_by').unsigned().notNullable();
      table.timestamp('checked_at').defaultTo(knex.fn.now());
      table.timestamps(true, true);

      table.foreign('batch_id').references('id').inTable('production_batches').onDelete('CASCADE');
      table.foreign('checked_by').references('id').inTable('users').onDelete('RESTRICT');

      table.index(['batch_id']);
      table.index(['check_type']);
      table.index(['result']);
    })

    // Stock movements table
    .createTableIfNotExists('stock_movements', function(table) {
      table.increments('id').primary();
      table.enum('item_type', ['product', 'material']).notNullable();
      table.integer('item_id').unsigned().notNullable();
      table.decimal('quantity', 10, 2).notNullable();
      table.enum('movement_type', ['in', 'out', 'adjustment']).notNullable();
      table.string('reference_type', 50); // 'production', 'sale', 'purchase', 'adjustment'
      table.integer('reference_id').unsigned();
      table.text('notes');
      table.integer('created_by').unsigned().notNullable();
      table.timestamps(true, true);

      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT');

      table.index(['item_type', 'item_id']);
      table.index(['movement_type']);
      table.index(['reference_type', 'reference_id']);
      table.index(['created_at']);
    })

    // Customers table
    .createTableIfNotExists('customers', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('code', 50);
      table.string('email', 100);
      table.string('phone', 20);
      table.text('address');
      table.string('contact_person', 100);
      table.string('city', 50);
      table.string('country', 50).defaultTo('Saudi Arabia');
      table.decimal('credit_limit', 15, 2).defaultTo(0);
      table.integer('payment_terms').defaultTo(30);
      table.string('vat_number', 20);
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);

      table.index(['code']);
      table.index(['name']);
      table.index(['status']);
    })

    // Sales orders table
    .createTableIfNotExists('sales_orders', function(table) {
      table.increments('id').primary();
      table.string('order_number', 50).notNullable();
      table.integer('customer_id').unsigned().notNullable();
      table.date('order_date').notNullable();
      table.date('delivery_date');
      table.decimal('total_amount', 12, 2).defaultTo(0);
      table.enum('status', ['pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']).defaultTo('pending');
      table.text('notes');
      table.integer('created_by').unsigned().notNullable();
      table.timestamps(true, true);

      table.foreign('customer_id').references('id').inTable('customers').onDelete('RESTRICT');
      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT');

      table.index(['order_number']);
      table.index(['customer_id']);
      table.index(['status']);
      table.index(['order_date']);
    })

    // Sales order items table
    .createTableIfNotExists('sales_order_items', function(table) {
      table.increments('id').primary();
      table.integer('order_id').unsigned().notNullable();
      table.integer('product_id').unsigned().notNullable();
      table.decimal('quantity', 10, 2).notNullable();
      table.decimal('unit_price', 10, 2).notNullable();
      table.decimal('total_price', 12, 2).notNullable();
      table.text('specifications');
      table.timestamps(true, true);

      table.foreign('order_id').references('id').inTable('sales_orders').onDelete('CASCADE');
      table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');

      table.index(['order_id']);
      table.index(['product_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('sales_order_items')
    .dropTableIfExists('sales_orders')
    .dropTableIfExists('customers')
    .dropTableIfExists('stock_movements')
    .dropTableIfExists('quality_checks')
    .dropTableIfExists('batch_materials')
    .dropTableIfExists('production_batches')
    .dropTableIfExists('equipment')
    .dropTableIfExists('materials')
    .dropTableIfExists('products')
    .dropTableIfExists('users');
};