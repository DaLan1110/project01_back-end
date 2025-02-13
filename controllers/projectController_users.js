const project_userModel = require('../models/projectModel_users');

// 處理密碼加密
const bcryptjs = require('bcryptjs');
const saltRounds = 10; // 增加計算哈希的難度 10, 12, 14 間 大部分 10, 12 最高安全 14

// 生成 JWT
const config = require('../config');
const jwt = require('jsonwebtoken');

// 上傳圖片
const multer = require('multer');
// 處理文件跟目錄路徑
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../img/member/company');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // 确保路径存在
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // 保持原文件名
    }
});
exports.upload = multer({ storage });

// 加密密碼
const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcryptjs.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

// 驗證密碼
const verifyPassword = async (password, hashedPassword) => {
    try {
        const match = await bcryptjs.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error verifying password:', error);
        throw error;
    }
};

// 取得所有---------------------
exports.getAllUsers = async (req, res) => {
    try {
        const users = await project_userModel.getAll(); // 這裡直接使用 async/await
        res.send(users);
    } catch (err) {
        console.log('錯誤', err);
        res.status(500).send({
            message: '伺服器錯誤'
        });
    }
};
// ----------------------------

// 取得單筆---------------------
exports.getUserById = async (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    try {
        // 使用 getOne 函式來查詢資料
        const user = await project_userModel.getOne(id);

        if (!user) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: 'User 不存在' });
        }

        // 返回找到的使用者
        res.send(user);
    } catch (err) {
        // 如果查詢發生錯誤，返回 500 伺服器錯誤
        console.error('查詢失敗:', err);
        res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 新增------------------------
exports.createUser = async (req, res) => {
    const { user_account, user_password, user_email } = req.body;

    // 驗證傳入的資料
    if (!user_account || typeof user_account !== 'string') {
        return res.status(400).send({ message: '使用者帳號 欄位缺少 或 格式錯誤' });
    }

    if (!user_password || typeof user_password !== 'string') {
        return res.status(400).send({ message: '使用者密碼 欄位缺少 或 格式錯誤' });
    }

    if (!user_email || typeof user_email !== 'string') {
        return res.status(400).send({ message: '使用者電子郵件 欄位缺少 或 格式錯誤' });
    }

    try {
        // 先檢查資料庫中是否有相同的 user_account
        const existingUser = await project_userModel.findByAccount(user_account);

        if (existingUser) {
            return res.status(400).send({ message: '已有相同帳號' });
        }

        // 密碼加密
        const hashedPassword = await hashPassword(user_password);

        // 創建新使用者
        const newUser = { user_account, user_password: hashedPassword, user_email };
        const createdUser = await project_userModel.create(newUser);

        res.status(201).send(createdUser);
    } catch (error) {
        console.error('新增使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 更新密碼---------------------
exports.updateUserPwd = async (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    // 檢查 ID 是否存在 以及 是否是有效的數字
    if (!id || isNaN(id)) {
        return res.status(400).send({ message: '無效的使用者 ID' });
    }

    // 驗證傳入的資料
    if (updateUser.user_password && typeof updateUser.user_password !== 'string') {
        return res.status(400).send({ message: 'Password 欄位格式錯誤' });
    }

    try {
        // 如果有密碼需要更新，進行加密
        if (updateUser.user_password) {
            updateUser.user_password = await hashPassword(updateUser.user_password);
        }

        const updatedUser = await project_userModel.updatePwd(id, updateUser);

        if (!updatedUser) {
            return res.status(404).send({ message: '使用者不存在' });
        }

        res.send(updatedUser);
    } catch (error) {
        console.error('更新使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 更新使用者資料---------------
exports.updateUserData = async (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    // 檢查 ID 是否存在及是否是有效的數字
    if (!id || isNaN(id)) {
        return res.status(400).send({ message: '無效的使用者 ID' });
    }

    // 驗證傳入的資料
    if (updateUser.user_email && typeof updateUser.user_email !== 'string') {
        return res.status(400).send({ message: 'Email 欄位格式錯誤' });
    }
    if (updateUser.username && typeof updateUser.username !== 'string') {
        return res.status(400).send({ message: 'Username 欄位格式錯誤' });
    }

    try {
        // 呼叫模型中的 updateUserData 函數
        const result = await project_userModel.updateUserData(id, updateUser);

        if (!result) {
            return res.status(404).send({ message: '找不到使用者資料' });
        }

        res.send({ message: '更新成功', data: result });
    } catch (err) {
        console.error('更新失敗:', err);
        res.status(500).send({ message: '更新失敗', error: err.message });
    }
};
// ----------------------------

// 更新權限---------------------
exports.updateUserPermissions = async (req, res) => {
    try {
        // 從請求的主體中提取 userId 和 permissions
        const { userId, permissions } = req.body;

        // 驗證請求的參數
        if (!userId || !permissions || typeof userId !== 'number' || typeof permissions !== 'string') {
            return res.status(400).json({ error: '參數格式無效' });
        }

        // 調用模型中的 updatePermissions 方法
        const updatedUser = await project_userModel.updatePermissions(userId, permissions);

        if (!updatedUser) {
            return res.status(404).json({ message: '用戶未找到' }); // 用戶未找到，返回 404
        }

        // 成功更新，返回用戶資料
        res.status(200).json({
            message: '用戶權限更新成功',
            data: updatedUser,
        });
    } catch (err) {
        console.error('伺服器錯誤: ', err);
        res.status(500).json({ error: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// 刪除單一---------------------
exports.deleteOneUser = async (req, res) => {
    const { id } = req.params; // 從請求中獲取 ID

    try {
        // 呼叫模型中的 `deleteOne` 函數
        const deletedUser = await project_userModel.deleteOne(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User 不存在' }); // 如果找不到，返回 404
        }

        // 成功刪除，返回刪除的使用者 ID
        res.status(200).json({
            message: 'User 刪除成功',
            data: deletedUser,
        });
    } catch (err) {
        console.error('伺服器錯誤: ', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 刪除多個---------------------
exports.deleteMoreUsers = async (req, res) => {
    const { ids } = req.body;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'ID 陣列無效或為空' });
    }

    try {
        // 調用模型刪除多個使用者
        const result = await project_userModel.deleteById(ids);

        // 如果沒有找到記錄，返回提示
        if (!result.deletedUserAccountCount || result.deletedUserAccountCount === 0) {
            return res.status(404).json({ message: '沒有找到要刪除的使用者' });
        }

        // 返回成功的刪除結果
        res.status(200).json({
            message: `${result.deletedUserAccountCount} 筆 useraccount 資料已刪除，${result.deletedUserDataCount} 筆 user_data 資料已刪除`,
        });
    } catch (err) {
        console.error('伺服器錯誤:', err);
        res.status(500).json({ message: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// 驗證使用者登入---------------
exports.loginUser = async (req, res) => {
    const { user_account, user_password } = req.body;

    // 驗證帳號和密碼是否有傳入
    if (!user_account || !user_password) {
        return res.status(400).send({ message: '請輸入帳號和密碼' });
    }

    try {
        // 根據帳號查找使用者
        const user = await project_userModel.UserAccount.findOne({
            where: { user_account }, // 根據 user_account 查找
        });

        // 如果找不到使用者，返回錯誤訊息
        if (!user) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }

        // 檢查密碼是否正確
        const isMatch = await verifyPassword(user_password, user.user_password);
        if (!isMatch) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }

        // 密碼正確，生成 JWT
        const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1h' });

        // 查詢 user_data 表中的資料
        const userData = await project_userModel.UserData.findOne({
            where: { userId: user.id }, // 根據 userId 查找
        });

        // 回傳 token 和 user 資訊
        res.send({
            message: '登入成功',
            token,
            user: {
                id: user.id,
                user_account: user.user_account,
                user_email: user.user_email,
                user_data: userData, // 包含從 user_data 表中獲取的資料
            },
        });
    } catch (err) {
        console.error('伺服器錯誤:', err);
        return res.status(500).send({ message: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// JWT 驗證中介軟體-------------
exports.checkJwt = (req, res) => {
    // 從請求標頭中提取 token
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        // 沒有 token 的情況下，返回 401 未授權
        return res.status(401).send({ message: '未提供 token' });
    }

    // 驗證 token 的有效性
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            // token 驗證失敗的情況下，返回 401 未授權
            return res.status(401).send({ message: 'Token 無效' });
        }

        // token 驗證成功，將解碼後的 userId 存入請求物件
        req.userId = decoded.id;

        res.send({ message: 'Token 驗證成功', valid: true });
    });
};

exports.updateUserAvatar = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: '請上傳頭像' });
    }
    res.send({ message: '頭像上傳成功', filename: req.file.originalname });
};

exports.deleteUserAvatar = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../img/member/company', filename); // 假設圖檔存放在 ../img/member/company 目錄中

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("刪除圖檔時發生錯誤:", err);
            return res.status(500).send({ message: '刪除圖檔失敗' });
        }
        res.send({ message: '圖檔刪除成功' });
    });
}