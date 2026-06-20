const pool = require('../config/db');

const MilestoneModel = {
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO milestones (project_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [data.project_id, data.title, data.description || null, data.due_date || null, data.status || 'Pending']
    );
    return result.insertId;
  },

  async findByProject(projectId) {
    const [rows] = await pool.execute(
      `SELECT m.*, (SELECT COUNT(*) FROM tasks WHERE milestone_id = m.id) as task_count,
       (SELECT COUNT(*) FROM tasks WHERE milestone_id = m.id AND status = 'Done') as completed_tasks
       FROM milestones m WHERE m.project_id = ? ORDER BY m.due_date ASC`,
      [projectId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM milestones WHERE id = ?', [id]);
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
    await pool.execute(`UPDATE milestones SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id) {
    await pool.execute('DELETE FROM milestones WHERE id = ?', [id]);
  }
};

module.exports = MilestoneModel;
