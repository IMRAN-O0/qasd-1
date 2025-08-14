/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const exists = await knex.schema.hasTable('files');
  if (exists) return;

  await knex.schema.createTable('files', (t) => {
    t.increments('id').primary();
    t.string('original_name').notNullable();
    t.string('stored_name').notNullable();
    t.string('mime_type').notNullable();
    t.bigint('size').notNullable();
    t.string('path').notNullable();
    t.timestamps(true, true);
    t.index(['stored_name']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('files');
