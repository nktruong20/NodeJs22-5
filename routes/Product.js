// ✅ File: routes/Product.js - Đã sửa để upload lên Cloudinary
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middlewares/upload'); // dùng Cloudinary

// ✅ POST: Tạo sản phẩm mới, upload media lên Cloudinary
router.post(
  '/',
  upload.fields([
    { name: 'introVideo', maxCount: 1 },
    { name: 'productVideos', maxCount: 10 },
    { name: 'productImages', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, ownerId } = req.body;
      if (!name || !ownerId)
        return res.status(400).json({ message: '❌ Thiếu tên sản phẩm hoặc ownerId' });

      let introVideoPath = '';
      if (req.files['introVideo']?.[0]) {
        introVideoPath = req.files['introVideo'][0].path;
      }

      let productVideoPaths = [];
      if (req.files['productVideos']) {
        productVideoPaths = req.files['productVideos'].map(file => file.path);
      }

      let productImagePaths = [];
      if (req.files['productImages']) {
        productImagePaths = req.files['productImages'].map(file => file.path);
      }

      const product = new Product({
        name,
        ownerId,
        introVideoPath,
        productVideoPaths,
        productImagePaths,
      });
      const saved = await product.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ message: '❌ Lỗi server khi tạo sản phẩm', error: err.message });
    }
  }
);

// ✅ PUT: Cập nhật sản phẩm, update file mới nếu có
router.put(
  '/:id',
  upload.fields([
    { name: 'introVideo', maxCount: 1 },
    { name: 'productVideos', maxCount: 10 },
    { name: 'productImages', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, ownerId } = req.body;
      const existing = await Product.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });

      let introVideoPath = existing.introVideoPath;
      if (req.files['introVideo']?.[0]) {
        introVideoPath = req.files['introVideo'][0].path;
      }

      let productVideoPaths = existing.productVideoPaths;
      if (req.files['productVideos']) {
        productVideoPaths = req.files['productVideos'].map(file => file.path);
      }

      let productImagePaths = existing.productImagePaths;
      if (req.files['productImages']) {
        productImagePaths = req.files['productImages'].map(file => file.path);
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { name, ownerId, introVideoPath, productVideoPaths, productImagePaths },
        { new: true, runValidators: true }
      );

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: '❌ Lỗi khi cập nhật sản phẩm', error: err.message });
    }
  }
);

// ✅ GET tất cả sản phẩm theo ownerId
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ message: 'Thiếu ownerId' });
    const products = await Product.find({ ownerId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: err.message });
  }
});

// ✅ GET sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error: err.message });
  }
});

// ✅ DELETE sản phẩm theo ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xoá' });
    res.json({ message: 'Đã xoá sản phẩm thành công', id: deleted._id });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá sản phẩm', error: err.message });
  }
});

module.exports = router;
