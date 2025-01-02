const express = require('express');
const router = express.Router();
const project_JoinUsController = require('../controllers/projectController_joinUs');

// Get All
router.get('/', project_JoinUsController.getAllJoinUs)

// Get One
router.get('/get/:id', project_JoinUsController.getJoinUsById)

// 新增 加入者
router.post('/createJoinUs', project_JoinUsController.createJoinUs)

// 刪除 多個加入者
router.delete('/deleteMoreJoinUs', project_JoinUsController.deleteMoreJoinUs)

// 刪除 單一加入者
router.delete('/deleteJoinUs/:id', project_JoinUsController.deleteJoinUsById)

// 更新 加入者資料
router.put('/updateJoinUs/:id', project_JoinUsController.updateJoinUsData)

// 更新 權限
router.put('/updatePermissions/:id', project_JoinUsController.updateJoinUsPermissions)

module.exports = router;