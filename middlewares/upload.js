const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cấu hình storage để gửi file lên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'products', // thư mục trên Cloudinary
      resource_type: 'auto', // tự động phân loại ảnh, video,...
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}` // tên file duy nhất
    };
  },
});

const upload = multer({ storage });
module.exports = upload;
