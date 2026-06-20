const express = require('express');
const router = express.Router();
const { getBugs, getBug, createBug, updateBug, deleteBug } = require('../controllers/bugController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getBugs);
router.post('/', createBug);
router.get('/:id', getBug);
router.put('/:id', updateBug);
router.delete('/:id', deleteBug);

module.exports = router;
