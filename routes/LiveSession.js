const express = require('express');
const router = express.Router();
const LiveSession = require('../models/LiveSession');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');

// ✅ Tạo phiên livestream mới
router.post('/', auth, async (req, res) => {
  try {
    const session = await LiveSession.create({
      ...req.body,
      ownerId: req.user.userId, // từ decoded JWT
      isLive: true
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Lấy danh sách phiên đang live của user hiện tại
router.get('/active', auth, async (req, res) => {
  try {
    const sessions = await LiveSession.find({ isLive: true, ownerId: req.user.userId }).populate('liveId');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// ✅ Lấy tất cả phiên livestream của user
router.get('/all', auth, async (req, res) => {
  try {
    const sessions = await LiveSession.find({ ownerId: req.user.userId }).populate('liveId');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Cập nhật session khi kết thúc livestream
router.patch('/:id', auth, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const user = await User.findById(session.ownerId);
    const resourceSpent = req.body.resourceSpent || 0;
    const remaining = user.liveQuotaHours - resourceSpent;

    const updated = await LiveSession.findByIdAndUpdate(
      req.params.id,
      {
        endTime: req.body.endTime,
        isLive: false,
        resourceSpent,
        remainingQuotaAfterSession: remaining
      },
      { new: true }
    );

    user.liveQuotaHours = remaining;
    await user.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// ✅ Xóa một phiên livestream theo ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Deleted successfully', session });
  } catch (err) {
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

// ✅ Xóa tất cả phiên livestream của user
router.delete('/', auth, async (req, res) => {
  try {
    const result = await LiveSession.deleteMany({ ownerId: req.user.userId });
    res.json({ message: 'All sessions deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Delete all error', error: err.message });
  }
});

module.exports = router;
