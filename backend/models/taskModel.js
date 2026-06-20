const pool = require('../config/db');

const TaskModel = {
  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO tasks (project_id, milestone_id, title, description, assignee_id, status, priority, due_date, estimated_hours, parent_task_id, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.project_id, data.milestone_id || null, data.title, data.description || null,
        data.assignee_id || null, data.status || 'Todo', data.priority || 'Medium',
        data.due_date || null, data.estimated_hours || 0, data.parent_task_id || null, data.position || 0
      ]
    );
    return result.insertId;
  },

  async findAll(filters = {}) {
    let query = `SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, p.name as project_name
                 FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN projects p ON t.project_id = p.id WHERE 1=1`;
    const values = [];

    if (filters.project_id) { query += ' AND t.project_id = ?'; values.push(filters.project_id); }
    if (filters.assignee_id) { query += ' AND t.assignee_id = ?'; values.push(filters.assignee_id); }
    if (filters.status) { query += ' AND t.status = ?'; values.push(filters.status); }
    if (filters.priority) { query += ' AND t.priority = ?'; values.push(filters.priority); }
    if (filters.parent_task_id === null) { query += ' AND t.parent_task_id IS NULL'; }
    else if (filters.parent_task_id) { query += ' AND t.parent_task_id = ?'; values.push(filters.parent_task_id); }

    query += ' ORDER BY t.position ASC, t.created_at DESC';
    const [rows] = await pool.execute(query, values);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, p.name as project_name
       FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByProject(projectId) {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
       FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = ? ORDER BY t.position ASC, t.created_at DESC`,
      [projectId]
    );
    return rows;
  },

  async findByAssignee(userId) {
    const [rows] = await pool.execute(
      `SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.assignee_id = ? ORDER BY t.due_date ASC`,
      [userId]
    );
    return rows;
  },

  async getSubtasks(parentId) {
    const [rows] = await pool.execute(
      'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.parent_task_id = ? ORDER BY t.position ASC',
      [parentId]
    );
    return rows;
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
    await pool.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async updateStatus(id, status) {
    await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  },

  async reorder(id, position, status) {
    await pool.execute('UPDATE tasks SET position = ?, status = ? WHERE id = ?', [position, status, id]);
  },

  async delete(id) {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
  },

  async getStats(projectId) {
    let query = `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'InProgress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN due_date < CURDATE() AND status != 'Done' THEN 1 ELSE 0 END) as overdue
      FROM tasks`;
    const values = [];
    if (projectId) { query += ' WHERE project_id = ?'; values.push(projectId); }
    const [rows] = await pool.execute(query, values);
    return rows[0];
  }
};

module.exports = TaskModel;
