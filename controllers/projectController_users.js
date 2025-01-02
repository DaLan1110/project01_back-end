const project_userModel = require('../models/projectModel_users');

const bcrypt = require('bcrypt');
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
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

// 驗證密碼
const verifyPassword = async (password, hashedPassword) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error verifying password:', error);
        throw error;
    }
};

exports.getAllUsers = (req, res) => {
    project_userModel.getAll((err, users) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(users)
    })
}

exports.getUserById = (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    // 調用 todoModel 的 getOne 函數
    project_userModel.getOne(id, (err, user) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!user) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: 'User 不存在' });
        }

        // 返回找到的使用者
        res.send(user);
    });
};

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
        const existingUser = await new Promise((resolve, reject) => {
            project_userModel.findByAccount(user_account, (err, user) => {
                if (err) return reject(err);
                resolve(user);
            });
        });

        if (existingUser) {
            return res.status(400).send({ message: '已有相同帳號' });
        }

        // 密碼加密
        const hashedPassword = await hashPassword(user_password);

        // 創建新使用者
        const newUser = { user_account, user_password: hashedPassword, user_email };
        const createdUser = await new Promise((resolve, reject) => {
            project_userModel.create(newUser, (err, user) => {
                if (err) return reject(err);
                resolve(user);
            });
        });

        res.status(201).send(createdUser);
    } catch (error) {
        console.error('新增使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}

exports.updateUser = async (req, res) => {
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
        const updateData = { ...updateUser };

        if (updateData.user_password) {
            // 密碼加密
            updateData.user_password = await hashPassword(updateData.user_password);
        }

        const updatedUser = await new Promise((resolve, reject) => {
            project_userModel.update(id, updateData, (err, user) => {
                if (err) return reject(err);
                resolve(user);
            });
        });

        if (!updatedUser) {
            return res.status(404).send({ message: '使用者不存在' });
        }

        res.send(updatedUser);
    } catch (error) {
        console.error('更新使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
};

exports.deleteOneUser = (req, res) => {
    const { id } = req.params;

    // 呼叫資料庫模型來刪除使用者
    project_userModel.deleteOne(id, (err, deletedUser) => {
        if (err) {
            console.error('刪除使用者失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!deletedUser) {
            return res.status(404).send({ message: 'User 不存在' });
        }

        // 返回刪除的使用者
        res.send(deletedUser);
    });
};

exports.deleteMoreUsers = (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ message: 'ID 陣列無效或為空' });
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_userModel.deleteById(ids, (err, result) => {
        if (err) {
            console.error('刪除使用者失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 如果 result 是空的，代表沒有使用者被刪除
        if (!result || result.deletedCount === 0) {
            return res.status(404).send({ message: '沒有找到要刪除的使用者' });
        }

        // 返回成功的刪除結果
        res.send({ message: `${result.deletedCount} 位使用者已被刪除` });
    });
};

exports.loginUser = (req, res) => {
    const { user_account, user_password } = req.body;

    // 驗證帳號和密碼是否有傳入
    if (!user_account || !user_password) {
        return res.status(400).send({ message: '請輸入帳號和密碼' });
    }

    project_userModel.findByAccount(user_account, async (err, user) => {
        if (err) return res.status(500).send({ message: '伺服器錯誤' });

        if (!user) return res.status(400).send({ message: '帳號或密碼錯誤' });

        // 檢查密碼是否正確
        const isMatch = await verifyPassword(user_password, user.user_password);
        if (!isMatch) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }

        // 密碼正確，生成 JWT
        const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1h' });
        console.log(token);

        // 查詢 user_data 表中的資料
        project_userModel.loginUser(user.id, (err, userData) => {
            if (err) return res.status(500).send({ message: '伺服器錯誤' });

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
        });
    });
};

// JWT 驗證中介軟體
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

exports.updateUserPermissions = async (req, res) => {
    try {
        // 從請求的主體中提取 userid 和更新的資料
        const { userId, permissions } = req.body; // 假設 userid 和 permissions 都在請求的主體中

        if (!userId || !permissions) {
            return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
        }

        // 調用 updatePermissions 函數
        project_userModel.updatePermissions(userId, { permissions }, (err, updatedUser) => {
            if (err) {
                return res.status(500).json({ error: '更新用戶權限時出錯' }); // 伺服器錯誤，返回 500
            }

            if (!updatedUser) {
                return res.status(404).json({ message: '用戶未找到' }); // 資料未找到，返回 404
            }

            // 成功更新，用戶資料
            res.status(200).json(updatedUser); // 返回更新後的用戶資料，狀態碼 200
        });
    } catch (error) {
        // 捕獲並處理任何其他異常錯誤
        console.error('伺服器錯誤: ', error);
        res.status(500).json({ error: '伺服器錯誤' }); // 伺服器錯誤，返回 500
    }
};

exports.updateUserData = async (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;
    console.log(req.body);

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