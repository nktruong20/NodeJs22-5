const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  liveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Live' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: Date,
  endTime: Date,
  resourceSpent: Number,
  isLive: Boolean,
  remainingQuotaAfterSession: Number
});

module.exports = mongoose.model('LiveSession', liveSessionSchema);
