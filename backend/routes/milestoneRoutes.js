const express = require('express');
const router = express.Router();
const { getMilestones, createMilestone, updateMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/project/:projectId', getMilestones);
router.post('/project/:projectId', createMilestone);
router.put('/:id', updateMilestone);
router.delete('/:id', deleteMilestone);

module.exports = router;
