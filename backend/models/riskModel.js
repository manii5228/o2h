const pool = require('../config/db');

const RiskModel = {
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO risks (project_id, title, description, probability, impact, mitigation, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.project_id, data.title, data.description || null, data.probability || 'Medium', data.impact || 'Medium', data.mitigation || null, data.owner_id || null]
    );
    return result.insertId;
  },

  async findByProject(projectId) {
    const [rows] = await pool.execute(
      'SELECT r.*, u.name as owner_name FROM risks r LEFT JOIN users u ON r.owner_id = u.id WHERE r.project_id = ? ORDER BY r.created_at DESC',
      [projectId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT r.*, u.name as owner_name FROM risks r LEFT JOIN users u ON r.owner_id = u.id WHERE r.id = ?',
      [id]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    if (fields.length === 0) return;
    values.push(id);
    await pool.execute(`UPDATE risks SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id) {
    await pool.execute('DELETE FROM risks WHERE id = ?', [id]);
  }
};

module.exports = RiskModel;
