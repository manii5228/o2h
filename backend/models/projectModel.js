const pool = require('../config/db');

const ProjectModel = {
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO projects (name, description, start_date, end_date, budget, priority, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.description || null, data.start_date || null, data.end_date || null, data.budget || 0, data.priority || 'Medium', data.status || 'Active', data.created_by]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name as creator_name,
       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done') as completed_tasks,
       (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
       FROM projects p LEFT JOIN users u ON p.created_by = u.id ORDER BY p.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name as creator_name FROM projects p LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByMember(userId) {
    const [rows] = await pool.execute(
      `SELECT p.*, pm.role_in_project FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ? ORDER BY p.created_at DESC`,
      [userId]
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
    await pool.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id) {
    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
  },

  async addMember(projectId, userId, role) {
    await pool.execute(
      'INSERT INTO project_members (project_id, user_id, role_in_project) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role_in_project = ?',
      [projectId, userId, role || 'Contributor', role || 'Contributor']
    );
  },

  async removeMember(projectId, userId) {
    await pool.execute('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
  },

  async getMembers(projectId) {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.skills, pm.role_in_project, pm.joined_at
       FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = ?`,
      [projectId]
    );
    return rows;
  },

  async getPortfolioStats() {
    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'OnHold' THEN 1 ELSE 0 END) as on_hold,
        SUM(CASE WHEN rag_status = 'Red' THEN 1 ELSE 0 END) as red,
        SUM(CASE WHEN rag_status = 'Amber' THEN 1 ELSE 0 END) as amber,
        SUM(CASE WHEN rag_status = 'Green' THEN 1 ELSE 0 END) as green
       FROM projects`
    );
    return rows[0];
  }
};

module.exports = ProjectModel;
