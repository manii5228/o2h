const TaskModel = require('../models/taskModel');
const ActivityLogModel = require('../models/activityLogModel');

const getTasks = async (req, res) => {
  try {
    const filters = {};
    if (req.query.project_id) filters.project_id = req.query.project_id;
    if (req.query.assignee_id) filters.assignee_id = req.query.assignee_id;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    const tasks = await TaskModel.findAll(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const subtasks = await TaskModel.getSubtasks(req.params.id);
    res.json({ ...task, subtasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const taskId = await TaskModel.create(req.body);
    await ActivityLogModel.create({
      project_id: req.body.project_id, task_id: taskId, user_id: req.user.id,
      action: 'Created task', details: req.body.title
    });
    const task = await TaskModel.findById(taskId);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await TaskModel.update(req.params.id, req.body);
    await ActivityLogModel.create({
      project_id: task.project_id, task_id: task.id, user_id: req.user.id,
      action: 'Updated task', details: JSON.stringify(req.body)
    });
    const updated = await TaskModel.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await TaskModel.delete(req.params.id);
    await ActivityLogModel.create({
      project_id: task.project_id, user_id: req.user.id,
      action: 'Deleted task', details: task.title
    });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await TaskModel.updateStatus(req.params.id, status);
    const task = await TaskModel.findById(req.params.id);
    await ActivityLogModel.create({
      project_id: task.project_id, task_id: task.id, user_id: req.user.id,
      action: 'Changed task status', details: status
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reorderTask = async (req, res) => {
  try {
    const { position, status } = req.body;
    await TaskModel.reorder(req.params.id, position, status);
    res.json({ message: 'Task reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const stats = await TaskModel.getStats(req.query.project_id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.findByAssignee(req.user.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, updateTaskStatus, reorderTask, getTaskStats, getMyTasks };
