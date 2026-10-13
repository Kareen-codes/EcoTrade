const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMyGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
} = require('../controllers/challengeGoalController');

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyGoals);
router.post('/', createGoal);
router.patch('/:id/progress', updateGoalProgress);
router.delete('/:id', deleteGoal);

module.exports = router;
