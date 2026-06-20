const MilestoneModel = require('../models/milestoneModel');

const getMilestones = async (req, res) => {
  try {
    const milestones = await MilestoneModel.findByProject(req.params.projectId);
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createMilestone = async (req, res) => {
  try {
    const id = await MilestoneModel.create({ ...req.body, project_id: req.params.projectId });
    const milestone = await MilestoneModel.findById(id);
    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMilestone = async (req, res) => {
  try {
    await MilestoneModel.update(req.params.id, req.body);
    const milestone = await MilestoneModel.findById(req.params.id);
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMilestone = async (req, res) => {
  try {
    await MilestoneModel.delete(req.params.id);
    res.json({ message: 'Milestone deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMilestones, createMilestone, updateMilestone, deleteMilestone };
