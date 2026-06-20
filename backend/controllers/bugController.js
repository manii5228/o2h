const BugModel = require('../models/bugModel');
const ActivityLogModel = require('../models/activityLogModel');

const getBugs = async (req, res) => {
  try {
    const bugs = await BugModel.findAll(req.query);
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBug = async (req, res) => {
  try {
    const bug = await BugModel.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createBug = async (req, res) => {
  try {
    const id = await BugModel.create({ ...req.body, reported_by: req.user.id });
    await ActivityLogModel.create({ project_id: req.body.project_id, user_id: req.user.id, action: 'Reported bug', details: req.body.title });
    const bug = await BugModel.findById(id);
    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBug = async (req, res) => {
  try {
    await BugModel.update(req.params.id, req.body);
    const bug = await BugModel.findById(req.params.id);
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBug = async (req, res) => {
  try {
    await BugModel.delete(req.params.id);
    res.json({ message: 'Bug deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBugs, getBug, createBug, updateBug, deleteBug };
