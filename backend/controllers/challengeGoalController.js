const Challenge = require('../models/challengeModel');
const Goal = require('../models/goalModel');
const User = require('../models/userModel');
const { createNotification } = require('../services/notificationService');
const { recordImpact } = require('../services/marketplaceService');

/**
 * Challenges + Personal Goals — EcoMate-specific modules.
 * NGOs/companies create challenges; users join, submit proof (photo +
 * weight), and earn rewards (badge/certificate/cash/voucher). Goals are
 * private weekly habits on the user's dashboard.
 */

// ---- Challenges ----

// GET /api/challenges?status=active&category=plastic&joined=true
const getChallenges = async (req, res) => {
  try {
    const { status, category, joined } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (joined === 'true' && req.user) filter['participants.user'] = req.user.id;

    const challenges = await Challenge.find(filter)
      .sort({ endsAt: 1 })
      .populate('creator', 'name profileImage');
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenges.', error: error.message });
  }
};

// GET /api/challenges/:id
const getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name profileImage')
      .populate('participants.user', 'name profileImage impact');
    if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenge.', error: error.message });
  }
};

// POST /api/challenges — NGO/company/admin only
const createChallenge = async (req, res) => {
  try {
    const { title, description, category, targetType, targetValue, reward, startsAt, endsAt, creatorOrg, coverImage } = req.body;
    if (!title || !description || !targetValue || !startsAt || !endsAt) {
      return res.status(400).json({ message: 'title, description, targetValue, startsAt and endsAt are required.' });
    }

    const challenge = await Challenge.create({
      creator: req.user.id,
      creatorOrg: creatorOrg || '',
      title,
      description,
      category: category || 'general',
      targetType: targetType || 'weight_kg',
      targetValue: Number(targetValue),
      reward: reward || { type: 'badge', label: title },
      startsAt,
      endsAt,
      coverImage: coverImage || '',
      status: new Date(startsAt) > new Date() ? 'upcoming' : 'active',
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error creating challenge.', error: error.message });
  }
};

// POST /api/challenges/:id/join
const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });
    if (challenge.status !== 'active' && challenge.status !== 'upcoming') {
      return res.status(400).json({ message: 'This challenge is no longer open.' });
    }
    if (challenge.participants.some((p) => p.user.toString() === req.user.id)) {
      return res.status(409).json({ message: 'You already joined this challenge.' });
    }

    challenge.participants.push({ user: req.user.id, progress: 0, submissions: [] });
    await challenge.save();
    res.status(201).json({ message: 'Joined challenge 🎉', participantCount: challenge.participants.length });
  } catch (error) {
    res.status(500).json({ message: 'Error joining challenge.', error: error.message });
  }
};

// POST /api/challenges/:id/submit — submit proof (photo + weight)
const submitProof = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });
    if (challenge.status !== 'active') return res.status(400).json({ message: 'Challenge is not active.' });

    const participant = challenge.participants.find((p) => p.user.toString() === req.user.id);
    if (!participant) return res.status(400).json({ message: 'Join the challenge before submitting proof.' });

    if (challenge.targetType === 'weight_kg' && !(Number(req.body.weightKg) > 0)) {
      return res.status(400).json({ message: 'weightKg is required for weight-based challenges.' });
    }

    participant.submissions.push({
      imageUrl: req.body.imageUrl || '',
      weightKg: Number(req.body.weightKg) || 0,
      note: req.body.note || '',
      status: 'pending',
    });

    await challenge.save();
    res.status(201).json({ message: 'Proof submitted for review.' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting proof.', error: error.message });
  }
};

// PATCH /api/challenges/:id/submissions/:submissionId — creator approves/rejects
const reviewSubmission = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });
    if (challenge.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the challenge creator can review submissions.' });
    }

    const { decision } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'." });
    }

    const participant = challenge.participants.find((p) =>
      p.submissions.some((s) => s._id.toString() === req.params.submissionId)
    );
    if (!participant) return res.status(404).json({ message: 'Submission not found.' });

    const submission = participant.submissions.id(req.params.submissionId);
    submission.status = decision;
    submission.reviewedBy = req.user.id;

    if (decision === 'approved') {
      participant.progress += submission.weightKg || 1;

      // Record participant impact
      await recordImpact(participant.user, challenge.category, submission.weightKg || 0, 1);

      // Target reached → award reward + notify
      if (participant.progress >= challenge.targetValue && !participant.completedAt) {
        participant.completedAt = new Date();
        participant.rewarded = true;

        if (challenge.reward?.type === 'badge' || challenge.reward?.type === 'certificate') {
          await User.findByIdAndUpdate(participant.user, {
            $push: {
              badges: {
                label: challenge.reward.label || challenge.title,
                challengeId: challenge._id,
              },
            },
          });
        } else if (challenge.reward?.type === 'cash' && challenge.reward.amount > 0) {
          await User.findByIdAndUpdate(participant.user, { $inc: { walletBalance: challenge.reward.amount } });
        }

        await createNotification(participant.user, 'challenge', 'Challenge completed! 🏆', `You completed "${challenge.title}" and earned: ${challenge.reward?.label || challenge.reward?.type || 'reward'}.`, { challengeId: challenge._id });
      }
    }

    await challenge.save();
    res.json({ message: `Submission ${decision}.`, progress: participant.progress });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing submission.', error: error.message });
  }
};

// ---- Personal Goals (private weekly habits) ----

// GET /api/goals?weekOf=2026-10-12 (defaults to current week)
const getMyGoals = async (req, res) => {
  try {
    const weekOf = req.query.weekOf ? new Date(req.query.weekOf) : startOfWeek(new Date());
    const goals = await Goal.find({ user: req.user.id, weekOf }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals.', error: error.message });
  }
};

// POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, targetType, targetValue, weekOf } = req.body;
    if (!title || !targetValue) {
      return res.status(400).json({ message: 'title and targetValue are required.' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetType: targetType || 'weight_kg',
      targetValue: Number(targetValue),
      weekOf: weekOf ? new Date(weekOf) : startOfWeek(new Date()),
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal.', error: error.message });
  }
};

// PATCH /api/goals/:id/progress — log progress (private)
const updateGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    goal.progress = Math.min(Number(req.body.progress) || 0, goal.targetValue);
    if (goal.progress >= goal.targetValue && !goal.completedAt) {
      goal.completedAt = new Date();
    }
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal.', error: error.message });
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal.', error: error.message });
  }
};

/** Monday 00:00 of the week containing `date` (local time). */
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = {
  getChallenges,
  getChallenge,
  createChallenge,
  joinChallenge,
  submitProof,
  reviewSubmission,
  getMyGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
};
