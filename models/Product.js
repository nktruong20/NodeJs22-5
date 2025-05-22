const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  introVideoPath: String,
  productVideoPaths: [String],
  productImagePaths: [String],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
