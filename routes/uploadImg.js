const express = require('express');
const router = express.Router();
const uploadMulter = require('../models/uploadMulter')
const uploadController = require('../controllers/uploadController')

// 上傳圖檔
router.post('/uploadImg', uploadMulter, uploadController.uploadImage);

// 刪除圖檔
router.post('/deleteImage', uploadMulter.deleteImage);

module.exports = router;