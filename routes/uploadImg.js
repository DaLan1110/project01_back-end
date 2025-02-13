const express = require('express');
const router = express.Router();
const uploadMulter = require('../models/uploadMulter')
const uploadController = require('../controllers/uploadController')

// 上傳圖檔
router.post('/uploadImg', uploadMulter, uploadController.uploadImage);

// 刪除圖檔
router.delete('/deleteImage/:imageUrl', uploadController.deleteImage);

module.exports = router;