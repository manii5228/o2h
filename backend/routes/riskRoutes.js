const express = require('express');
const router = express.Router();
const { getRisks, createRisk, updateRisk, deleteRisk } = require('../controllers/riskController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getRisks);
router.post('/', createRisk);
router.put('/:id', updateRisk);
router.delete('/:id', deleteRisk);

module.exports = router;
