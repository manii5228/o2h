const pool = require('../config/db');

const ActivityLogModel = {
  async create(data) {
    await pool.execute(
      'INSERT INTO activity_log (project_id, task_id, user_id, action, details) VALUES (?, ?, ?, ?, ?)',
      [data.project_id || null, data.task_id || null, data.user_id, data.action, data.details || null]
    );
  },

  async findByProject(projectId, limit = 20) {
    const [rows] = await pool.query(
      `SELECT al.*, u.name as user_name, u.avatar as user_avatar FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id WHERE al.project_id = ? ORDER BY al.created_at DESC LIMIT ?`,
      [projectId, parseInt(limit, 10)]
    );
    return rows;
  },

  async findRecent(limit = 30) {
    const [rows] = await pool.query(
      `SELECT al.*, u.name as user_name, u.avatar as user_avatar, p.name as project_name
       FROM activity_log al LEFT JOIN users u ON al.user_id = u.id LEFT JOIN projects p ON al.project_id = p.id
       ORDER BY al.created_at DESC LIMIT ?`,
      [parseInt(limit, 10)]
    );
    return rows;
  }
};

module.exports = ActivityLogModel;
