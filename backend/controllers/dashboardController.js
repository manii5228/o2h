const TaskModel = require('../models/taskModel');
const ProjectModel = require('../models/projectModel');
const ActivityLogModel = require('../models/activityLogModel');
const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const projectStats = await ProjectModel.getPortfolioStats();
    const taskStats = await TaskModel.getStats();

    const [budgetRows] = await pool.execute(
      'SELECT COALESCE(SUM(budget), 0) as total_budget FROM projects WHERE status = ?', ['Active']
    );

    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');

    res.json({
      projects: projectStats,
      tasks: taskStats,
      total_budget: budgetRows[0].total_budget,
      total_users: userCount[0].count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const activity = await ActivityLogModel.findRecent(req.query.limit || 30);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOverdueTasks = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as assignee_name, p.name as project_name FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.due_date < CURDATE() AND t.status != 'Done' ORDER BY t.due_date ASC LIMIT 20`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats, getRecentActivity, getOverdueTasks };
