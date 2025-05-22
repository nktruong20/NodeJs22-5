const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/User');
const liveSessionRoutes = require('./routes/LiveSession');
const productRoutes = require('./routes/Product');
const liveRoutes = require('./routes/Live');
const authMiddleware = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Kết nối MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/liveVideoDB';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware xử lý JSON
app.use(express.json());

// ✅ Middleware xử lý CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Endpoint xác thực user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Đăng ký các routes
app.use('/api/users', userRoutes);
app.use('/api/livesessions', liveSessionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lives', liveRoutes);

// ✅ Load models
require('./models/User');
require('./models/Product');
require('./models/Live');
require('./models/LiveSession');

// ✅ Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
