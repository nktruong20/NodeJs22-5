const mongoose = require('mongoose');

const liveSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['withVideo', 'withImage'] },
  liveProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  liveAudioPaths: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Live', liveSchema);
