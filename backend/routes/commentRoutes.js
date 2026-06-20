const express = require('express');
const router = express.Router();
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/task/:taskId', getComments);
router.post('/task/:taskId', createComment);
router.delete('/:id', deleteComment);

module.exports = router;
