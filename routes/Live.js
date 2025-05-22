// File: routes/Live.js - sửa để upload audio lên Cloudinary
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // dùng Cloudinary
const Live = require('../models/Live');

// ✅ POST /lives → tạo mới 1 live (upload audio lên Cloudinary)
router.post('/', upload.array('liveAudioFiles'), async (req, res) => {
  try {
    const { name, type, liveProductIds, createdBy } = req.body;
    if (!name || !type || !createdBy) {
      return res.status(400).json({ message: 'Thiếu trường bắt buộc (name, type, createdBy)' });
    }

    let liveAudioPaths = [];
    if (req.files && req.files.length > 0) {
      liveAudioPaths = req.files.map(file => file.path); // link từ Cloudinary
    }

    const newLive = new Live({
      name,
      type,
      createdBy,
      liveProductIds: liveProductIds ? JSON.parse(liveProductIds) : [],
      liveAudioPaths,
    });

    const saved = await newLive.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Upload audio thất bại:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo live', error: err.message });
  }
});

// ✅ PUT /lives/:id → cập nhật live (upload lại audio nếu có)
router.put('/:id', upload.array('liveAudioFiles'), async (req, res) => {
  try {
    const { name, type, liveProductIds } = req.body;
    const updateData = { name, type };

    if (liveProductIds) updateData.liveProductIds = JSON.parse(liveProductIds);

    if (req.files && req.files.length > 0) {
      updateData.liveAudioPaths = req.files.map(file => file.path);
    } else if (req.body.liveAudioPaths) {
      updateData.liveAudioPaths = Array.isArray(req.body.liveAudioPaths)
        ? req.body.liveAudioPaths
        : [req.body.liveAudioPaths];
    }

    const updated = await Live.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ message: 'Không tìm thấy live để cập nhật' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật live', error: err.message });
  }
});

// ✅ GET danh sách live theo createdBy
router.get('/', async (req, res) => {
  try {
    const { createdBy } = req.query;
    if (!createdBy) return res.status(400).json({ message: 'Thiếu createdBy' });

    const lives = await Live.find({ createdBy })
      .populate({
        path: 'liveProductIds',
        select: 'name introVideoPath productVideoPaths productImagePaths'
      })
      .sort({ createdAt: -1 });

    res.json(lives);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách live', error: err.message });
  }
});

// ✅ GET chi tiết 1 live
router.get('/:id', async (req, res) => {
  try {
    const live = await Live.findById(req.params.id)
      .populate({
        path: 'liveProductIds',
        select: 'name introVideoPath productVideoPaths productImagePaths'
      });

    if (!live) return res.status(404).json({ message: 'Không tìm thấy live' });
    res.json(live);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết live', error: err.message });
  }
});

// ✅ DELETE 1 live
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Live.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy live để xoá' });
    res.json({ message: 'Đã xoá live thành công', id: deleted._id });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá live', error: err.message });
  }
});

module.exports = router;