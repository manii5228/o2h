const pool = require('../config/db');

const TimeEntryModel = {
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO time_entries (task_id, user_id, hours, notes, is_billable, date) VALUES (?, ?, ?, ?, ?, ?)',
      [data.task_id, data.user_id, data.hours, data.notes || null, data.is_billable !== false, data.date]
    );
    return result.insertId;
  },

  async findByTask(taskId) {
    const [rows] = await pool.execute(
      'SELECT te.*, u.name as user_name FROM time_entries te JOIN users u ON te.user_id = u.id WHERE te.task_id = ? ORDER BY te.date DESC',
      [taskId]
    );
    return rows;
  },

  async findByUser(userId, startDate, endDate) {
    let query = 'SELECT te.*, t.title as task_title, p.name as project_name FROM time_entries te JOIN tasks t ON te.task_id = t.id JOIN projects p ON t.project_id = p.id WHERE te.user_id = ?';
    const values = [userId];
    if (startDate) { query += ' AND te.date >= ?'; values.push(startDate); }
    if (endDate) { query += ' AND te.date <= ?'; values.push(endDate); }
    query += ' ORDER BY te.date DESC';
    const [rows] = await pool.execute(query, values);
    return rows;
  },

  async findAll(filters = {}) {
    let query = 'SELECT te.*, u.name as user_name, t.title as task_title FROM time_entries te JOIN users u ON te.user_id = u.id JOIN tasks t ON te.task_id = t.id WHERE 1=1';
    const values = [];
    if (filters.status) { query += ' AND te.status = ?'; values.push(filters.status); }
    if (filters.user_id) { query += ' AND te.user_id = ?'; values.push(filters.user_id); }
    query += ' ORDER BY te.date DESC';
    const [rows] = await pool.execute(query, values);
    return rows;
  },

  async approve(id) {
    await pool.execute('UPDATE time_entries SET status = ? WHERE id = ?', ['Approved', id]);
  },

  async reject(id) {
    await pool.execute('UPDATE time_entries SET status = ? WHERE id = ?', ['Rejected', id]);
  },

  async delete(id) {
    await pool.execute('DELETE FROM time_entries WHERE id = ?', [id]);
  },

  async getTotalByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT SUM(hours) as total_hours, SUM(CASE WHEN is_billable = 1 THEN hours ELSE 0 END) as billable_hours FROM time_entries WHERE user_id = ? AND status = ?',
      [userId, 'Approved']
    );
    return rows[0];
  }
};

module.exports = TimeEntryModel;
