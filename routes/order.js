const express = require('express');
const router = express.Router();
const project_orderController = require('../controllers/projectController_orders');

// Get All
router.get('/', project_orderController.getAllOrders)

// Get One
router.get('/get/:id', project_orderController.getOrderById)

// Get One Member All Orders
router.get('/getByMemberId/:memberId', project_orderController.getOrderByMemberId)

// 更新 訂單狀態
router.put('/updateOrderState/:id', project_orderController.updateOrderState)

// 刪除 多個訂單
router.delete('/deleteMoreOrders', project_orderController.deleteMoreOrders)

// 新增 產品至購物車
router.post('/insertShoppingCart', project_orderController.insertShoppingCart)

// 查看 購物車清單
router.get('/getShoppingList/:memberId', project_orderController.getShoppingList)

// 更新 產品數量
router.put('/updateShopQuantity/:id', project_orderController.updateShopQuantity)

// 刪除 購物車上的單一產品
router.delete('/deleteShoppingProduct/:id', project_orderController.deleteShoppingProductById)

// 新增 下訂單
router.post('/insertOrder/:memberId', project_orderController.insertOrder)

// 取得前 6 筆資料
router.get('/getOrdersToSix', project_orderController.getOrdersToSix)

// 取得前 5 筆熱門商品
router.get('/getHotProduct', project_orderController.getHotProduct)

module.exports = router;