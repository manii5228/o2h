const CommentModel = require('../models/commentModel');

const getComments = async (req, res) => {
  try {
    const comments = await CommentModel.findByTask(req.params.taskId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const id = await CommentModel.create({ ...req.body, task_id: req.params.taskId, user_id: req.user.id });
    res.status(201).json({ id, message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    await CommentModel.delete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getComments, createComment, deleteComment };
