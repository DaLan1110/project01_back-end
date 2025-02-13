const express = require('express');
const router = express.Router();
const uploadMulter = require('../models/uploadMulter')
const uploadController = require('../controllers/uploadController')

// Product
// 上傳 產品圖檔
router.post('/uploadImgToProduct', uploadMulter, uploadController.uploadImageToProduct);

// 刪除 產品圖檔
router.delete('/deleteImageToProduct/:publicId', uploadController.deleteImageToProduct);

// User
// 上傳 公司圖檔
router.post('/uploadImgToUser', uploadMulter, uploadController.uploadImageToUser);

// 刪除 公司圖檔
router.delete('/deleteImageToUser/:publicId', uploadController.deleteImageToUser);

// Member
// 上傳 會員圖檔
router.post('/uploadImgToMember', uploadMulter, uploadController.uploadImageToMember);

// 刪除 會員圖檔
router.delete('/deleteImageToMember/:publicId', uploadController.deleteImageToMember);

module.exports = router;