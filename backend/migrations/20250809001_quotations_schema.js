/**
 * Create quotations and quotation_items tables for sales module
 */

exports.up = async function(knex) {
  const hasQuotations = await knex.schema.hasTable('quotations');
  if (!hasQuotations) {
    await knex.schema.createTable('quotations', table => {
      table.increments('id').primary();
      table.string('number', 20).notNullable().unique();
      table.integer('customer_id').unsigned().notNullable();
      table.date('date').notNullable();
      table.date('valid_until');
      table.decimal('subtotal', 15, 2).notNullable();
      table.decimal('tax_amount', 15, 2).defaultTo(0);
      table.decimal('discount_amount', 15, 2).defaultTo(0);
      table.decimal('total', 15, 2).notNullable();
      table.string('status', 20).defaultTo('draft');
      table.text('notes');
      table.integer('created_by').unsigned();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('customer_id').references('id').inTable('customers');
      table.foreign('created_by').references('id').inTable('users');
    });
  }

  const hasQuotationItems = await knex.schema.hasTable('quotation_items');
  if (!hasQuotationItems) {
    await knex.schema.createTable('quotation_items', table => {
      table.increments('id').primary();
      table.integer('quotation_id').unsigned().notNullable();
      table.integer('product_id').unsigned().notNullable();
      table.decimal('quantity', 10, 2).notNullable();
      table.decimal('unit_price', 10, 2).notNullable();
      table.decimal('total_price', 12, 2).notNullable();
      table.text('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('quotation_id').references('id').inTable('quotations').onDelete('CASCADE');
      table.foreign('product_id').references('id').inTable('products');
    });
  }
};

exports.down = async function(knex) {
  const hasQuotationItems = await knex.schema.hasTable('quotation_items');
  if (hasQuotationItems) {
    await knex.schema.dropTable('quotation_items');
  }

  const hasQuotations = await knex.schema.hasTable('quotations');
  if (hasQuotations) {
    await knex.schema.dropTable('quotations');
  }
};