const express = require('express');
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, updateTaskStatus, reorderTask, getTaskStats, getMyTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/my', getMyTasks);
router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/reorder', reorderTask);

module.exports = router;
