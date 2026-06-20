const pool = require('../config/db');

const CommentModel = {
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO comments (task_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      [data.task_id, data.user_id, data.content, data.parent_comment_id || null]
    );
    return result.insertId;
  },

  async findByTask(taskId) {
    const [rows] = await pool.execute(
      'SELECT c.*, u.name as user_name, u.avatar as user_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = ? ORDER BY c.created_at ASC',
      [taskId]
    );
    return rows;
  },

  async delete(id) {
    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
  }
};

module.exports = CommentModel;
