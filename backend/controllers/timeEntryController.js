const TimeEntryModel = require('../models/timeEntryModel');

const getTimeEntries = async (req, res) => {
  try {
    const entries = await TimeEntryModel.findAll(req.query);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyTimeEntries = async (req, res) => {
  try {
    const entries = await TimeEntryModel.findByUser(req.user.id, req.query.start_date, req.query.end_date);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTimeEntry = async (req, res) => {
  try {
    const id = await TimeEntryModel.create({ ...req.body, user_id: req.user.id });
    res.status(201).json({ id, message: 'Time entry created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const approveTimeEntry = async (req, res) => {
  try {
    await TimeEntryModel.approve(req.params.id);
    res.json({ message: 'Time entry approved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rejectTimeEntry = async (req, res) => {
  try {
    await TimeEntryModel.reject(req.params.id);
    res.json({ message: 'Time entry rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTimeEntry = async (req, res) => {
  try {
    await TimeEntryModel.delete(req.params.id);
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTimeEntries, getMyTimeEntries, createTimeEntry, approveTimeEntry, rejectTimeEntry, deleteTimeEntry };
