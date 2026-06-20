const pool = require('../config/db');

const BugModel = {
  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO bugs (project_id, task_id, title, description, environment, steps_to_reproduce, expected_behavior, severity, reported_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.project_id, data.task_id || null, data.title, data.description || null, data.environment || null,
       data.steps_to_reproduce || null, data.expected_behavior || null, data.severity || 'Medium', data.reported_by, data.assigned_to || null]
    );
    return result.insertId;
  },

  async findAll(filters = {}) {
    let query = `SELECT b.*, u1.name as reporter_name, u2.name as assignee_name, p.name as project_name
                 FROM bugs b LEFT JOIN users u1 ON b.reported_by = u1.id LEFT JOIN users u2 ON b.assigned_to = u2.id
                 LEFT JOIN projects p ON b.project_id = p.id WHERE 1=1`;
    const values = [];
    if (filters.project_id) { query += ' AND b.project_id = ?'; values.push(filters.project_id); }
    if (filters.status) { query += ' AND b.status = ?'; values.push(filters.status); }
    query += ' ORDER BY b.created_at DESC';
    const [rows] = await pool.execute(query, values);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, u1.name as reporter_name, u2.name as assignee_name FROM bugs b
       LEFT JOIN users u1 ON b.reported_by = u1.id LEFT JOIN users u2 ON b.assigned_to = u2.id WHERE b.id = ?`,
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
    await pool.execute(`UPDATE bugs SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id) {
    await pool.execute('DELETE FROM bugs WHERE id = ?', [id]);
  }
};

module.exports = BugModel;
