const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clear existing entries in correct order (reverse of creation)
  // Only clear tables that exist in our current migration
  await knex('users').del();

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Insert users first
  await knex('users').insert([
    {
      id: 1,
      username: 'admin',
      email: 'admin@qasd.com',
      password_hash: hashedPassword,
      role: 'admin'
    },
    {
      id: 2,
      username: 'manager',
      email: 'manager@qasd.com',
      password_hash: hashedPassword,
      role: 'manager'
    },
    {
      id: 3,
      username: 'supervisor',
      email: 'supervisor@qasd.com',
      password_hash: hashedPassword,
      role: 'supervisor'
    },
    {
      id: 4,
      username: 'operator',
      email: 'operator@qasd.com',
      password_hash: hashedPassword,
      role: 'user'
    }
  ]);

  // Note: Skipping products, customers and other tables as they don't exist in current migration

  console.log('✅ Initial seed data inserted successfully!');
};