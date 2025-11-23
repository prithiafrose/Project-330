const express = require('express');
const router = express.Router();
const { getHistory, clearHistory, getHistoryStats } = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getHistory);
router.get('/stats', authMiddleware, getHistoryStats);
router.delete('/', authMiddleware, clearHistory);

module.exports = router;