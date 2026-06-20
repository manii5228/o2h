const pool = require('../config/db');

const UserModel = {
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, phone, department) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.email, data.password, data.role || 'Contributor', data.phone || null, data.department || null]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, avatar, skills, phone, department, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, avatar, skills, phone, department, created_at FROM users'
    );
    return rows;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(key === 'skills' ? JSON.stringify(data[key]) : data[key]);
      }
    });
    if (fields.length === 0) return;
    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = UserModel;
