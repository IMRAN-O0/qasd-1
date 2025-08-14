const r = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

r.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username/password required' });
  }
  
  const u = await db('users').where({ username }).first();
  if (!u || !bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: u.id, username: u.username, role: u.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  res.json({
    token,
    user: { id: u.id, username: u.username, role: u.role }
  });
});

r.get('/me', require('../middleware/authRequired'), async (req, res) => {
  const u = await db('users').where({ id: req.user.id }).first();
  res.json({ id: u.id, username: u.username, role: u.role });
});

module.exports = r;