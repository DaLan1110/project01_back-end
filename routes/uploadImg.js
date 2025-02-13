const express = require('express');
const router = express.Router();
const uploadMulter = require('../models/uploadMulter')
const uploadController = require('../controllers/uploadController')

// 上傳照片
router.post('/uploadImg', uploadMulter, uploadController.uploadImage);

module.exports = router;