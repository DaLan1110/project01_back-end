const express = require('express');
const router = express.Router();
const project_memberController = require('../controllers/projectController_members');

// Get All
router.get('/', project_memberController.getAllMembers)

// Get One
router.get('/get/:id', project_memberController.getMemberById)

// 更新 權限
router.put('/updatePermissions/:id', project_memberController.updateMemberPermissions)

// 新增 會員
router.post('/createMember', project_memberController.createMember)

// 更新 會員密碼
router.put('/updateMemberPwd/:id', project_memberController.updateMemberPwd)

// 刪除 多個會員
router.delete('/deleteMoreMembers', project_memberController.deleteMoreMembers)

// 更新 會員資料
router.put('/updateMember/:id', project_memberController.updateMemberData)

// 上傳頭像
router.post('/uploadMemberAvatar', project_memberController.upload.single('avatar'), project_memberController.updateMemberAvatar)

// 刪除舊頭像
router.delete('/deleteMemberAvatar/:filename', project_memberController.deleteMemberAvatar)

// Login Member
router.post('/login', project_memberController.loginMember);

// Check Jwt
router.get('/checkJwt', project_memberController.checkJwt);

module.exports = router;