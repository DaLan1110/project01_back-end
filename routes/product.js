const express = require('express');
const router = express.Router();
const project_productController = require('../controllers/projectController_product');

// Get All
router.get('/', project_productController.getAllProducts)

// Get One
router.get('/get/:id', project_productController.getProductById)

// 更新 上下架
router.put('/updateExhibit/:id', project_productController.updateProductExhibit)

// 新增 產品
router.post('/createProduct', project_productController.createProductData)

// 更新 產品資料
router.put('/updateProduct/:id', project_productController.updateProductData)

// 刪除 多個產品
router.delete('/deleteMoreProducts', project_productController.deleteMoreProducts)

// 上傳 產品圖 
router.post('/uploadProductImg', project_productController.upload.single('product'), project_productController.updateProductImg)

// 刪除 舊產品圖
router.delete('/deleteProductImg/:filename', project_productController.deleteProductImg)


module.exports = router;