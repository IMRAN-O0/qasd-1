// Align MySQL types: make users.id UNSIGNED to match foreign key references created by later tables

exports.up = async function(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) return;
  // Change primary key to unsigned
  await knex.schema.raw('ALTER TABLE `users` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
};

exports.down = async function(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) return;
  await knex.schema.raw('ALTER TABLE `users` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
};

