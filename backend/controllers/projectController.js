const ProjectModel = require('../models/projectModel');
const ActivityLogModel = require('../models/activityLogModel');

const getProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.findAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const members = await ProjectModel.getMembers(req.params.id);
    res.json({ ...project, members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const projectId = await ProjectModel.create({ ...req.body, created_by: req.user.id });
    await ProjectModel.addMember(projectId, req.user.id, 'PM');
    await ActivityLogModel.create({ project_id: projectId, user_id: req.user.id, action: 'Created project', details: req.body.name });
    const project = await ProjectModel.findById(projectId);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await ProjectModel.update(req.params.id, req.body);
    await ActivityLogModel.create({ project_id: req.params.id, user_id: req.user.id, action: 'Updated project', details: JSON.stringify(req.body) });
    const updated = await ProjectModel.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await ProjectModel.delete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { user_id, role } = req.body;
    await ProjectModel.addMember(req.params.id, user_id, role);
    await ActivityLogModel.create({ project_id: req.params.id, user_id: req.user.id, action: 'Added member', details: `User ${user_id}` });
    const members = await ProjectModel.getMembers(req.params.id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    await ProjectModel.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await ProjectModel.getMembers(req.params.id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPortfolioStats = async (req, res) => {
  try {
    const stats = await ProjectModel.getPortfolioStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember, getMembers, getPortfolioStats };
