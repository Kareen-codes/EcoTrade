const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getChallenges,
  getChallenge,
  createChallenge,
  joinChallenge,
  submitProof,
  reviewSubmission,
} = require('../controllers/challengeGoalController');

const router = express.Router();

// Reads (joined filter uses req.user when authenticated)
router.get('/', verifyToken, getChallenges);
router.get('/:id', getChallenge);

// Writes
router.post('/', verifyToken, createChallenge);
router.post('/:id/join', verifyToken, joinChallenge);
router.post('/:id/submit', verifyToken, submitProof);
router.patch('/:id/submissions/:submissionId', verifyToken, reviewSubmission);

module.exports = router;
