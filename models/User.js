const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
  liveQuotaHours: { type: Number, default: 360*3600 }
});

module.exports = mongoose.model('User', userSchema);
