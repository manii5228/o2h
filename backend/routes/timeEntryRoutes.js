const express = require('express');
const router = express.Router();
const { getTimeEntries, getMyTimeEntries, createTimeEntry, approveTimeEntry, rejectTimeEntry, deleteTimeEntry } = require('../controllers/timeEntryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/my', getMyTimeEntries);
router.get('/', getTimeEntries);
router.post('/', createTimeEntry);
router.patch('/:id/approve', authorize('PM', 'TeamLead'), approveTimeEntry);
router.patch('/:id/reject', authorize('PM', 'TeamLead'), rejectTimeEntry);
router.delete('/:id', deleteTimeEntry);

module.exports = router;
