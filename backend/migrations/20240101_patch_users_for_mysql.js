// Patch existing users table to include columns expected by later migrations

exports.up = async function(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) return;

  const addCol = async (name, cb) => {
    const exists = await knex.schema.hasColumn('users', name);
    if (!exists) {
      await knex.schema.alterTable('users', cb);
    }
  };

  await addCol('username', t => t.string('username', 50));
  await addCol('password_hash', t => t.string('password_hash', 255));
  await addCol('first_name', t => t.string('first_name', 50));
  await addCol('last_name', t => t.string('last_name', 50));
  await addCol('role', t => t.enu('role', ['admin', 'manager', 'supervisor', 'user']).defaultTo('user'));
  await addCol('status', t => t.enu('status', ['active', 'inactive', 'suspended']).defaultTo('active'));
  await addCol('last_login', t => t.timestamp('last_login'));
  await addCol('created_at', t => t.timestamp('created_at').defaultTo(knex.fn.now()));
  await addCol('updated_at', t => t.timestamp('updated_at').defaultTo(knex.fn.now()));
};

exports.down = async function(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) return;

  const dropCol = async (name) => {
    const exists = await knex.schema.hasColumn('users', name);
    if (exists) {
      await knex.schema.alterTable('users', t => {
        t.dropColumn(name);
      });
    }
  };

  await dropCol('username');
  await dropCol('password_hash');
  await dropCol('first_name');
  await dropCol('last_name');
  await dropCol('role');
  await dropCol('status');
  await dropCol('last_login');
  await dropCol('created_at');
  await dropCol('updated_at');
};

