const RiskModel = require('../models/riskModel');

const getRisks = async (req, res) => {
  try {
    const risks = await RiskModel.findByProject(req.query.project_id);
    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createRisk = async (req, res) => {
  try {
    const id = await RiskModel.create(req.body);
    const risk = await RiskModel.findById(id);
    res.status(201).json(risk);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateRisk = async (req, res) => {
  try {
    await RiskModel.update(req.params.id, req.body);
    const risk = await RiskModel.findById(req.params.id);
    res.json(risk);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteRisk = async (req, res) => {
  try {
    await RiskModel.delete(req.params.id);
    res.json({ message: 'Risk deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getRisks, createRisk, updateRisk, deleteRisk };
