const express = require('express');
const router = express.Router();
const project_userController = require('../controllers/projectController_users');

// Get All
router.get('/', project_userController.getAllUsers);

// Create
router.post('/create', project_userController.createUser);

// Update Pwd
router.put('/edit/:id', project_userController.updateUserPwd)

// Get One User
router.get('/get/:id', project_userController.getUserById)

// Delete One User
router.delete('/deleteOneUser/:id', project_userController.deleteOneUser)

// Delete Many User
router.delete('/deleteMoreUsers', project_userController.deleteMoreUsers)

// Login User
router.post('/login', project_userController.loginUser);

// Check Jwt
router.get('/checkJwt', project_userController.checkJwt);

// 更新 權限
router.put('/savePermissions', project_userController.updateUserPermissions)

// 更新 個人資料
router.put('/update/:id', project_userController.updateUserData)

// 上傳頭像
router.post('/upload-avatar', project_userController.upload.single('avatar'), project_userController.updateUserAvatar)

// 更新頭像後刪除舊頭像
router.delete('/delete-avatar/:filename', project_userController.deleteUserAvatar)

module.exports = router;