const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember, getMembers, getPortfolioStats } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getPortfolioStats);
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', authorize('PM'), deleteProject);
router.get('/:id/members', getMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
