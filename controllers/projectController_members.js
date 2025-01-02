const project_memberModel = require('../models/projectModel_members');

// 生成 JWT
const config = require('../config');
const jwt = require('jsonwebtoken');

// 處理密碼加密
const bcrypt = require('bcryptjs');
const saltRounds = 10; // 增加計算哈希的難度 10, 12, 14 間 大部分 10, 12 最高安全 14

// 上傳圖片
const multer = require('multer');
// 處理文件跟目錄路徑
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../img/member/member');
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

// 取得所有---------------------
exports.getAllMembers = (req, res) => {
    project_memberModel.getAll((err, members) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(members)
    })
}
// ----------------------------

// 取得單筆---------------------
exports.getMemberById = (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    // 調用 todoModel 的 getOne 函數
    project_memberModel.getOne(id, (err, member) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!member) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: '會員 不存在' });
        }

        // 返回找到的使用者
        res.send(member);
    });
};
// ----------------------------

// 更新權限---------------------
exports.updateMemberPermissions = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const { id } = req.params;
        const { permissions } = req.body;

        if (!id || !permissions) {
            return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
        }

        // 調用 updatePermissions 函數
        project_memberModel.updatePermissions(id, { permissions }, (err, updatedMember) => {
            if (err) {
                return res.status(500).json({ error: '更新用戶權限時出錯' }); // 伺服器錯誤，返回 500
            }

            if (!updatedMember) {
                return res.status(404).json({ message: '用戶未找到' }); // 資料未找到，返回 404
            }

            // 成功更新，用戶資料
            res.status(200).json(updatedMember); // 返回更新後的用戶資料，狀態碼 200
        });
    } catch (error) {
        // 捕獲並處理任何其他異常錯誤
        console.error('伺服器錯誤: ', error);
        res.status(500).json({ error: '伺服器錯誤' }); // 伺服器錯誤，返回 500
    }
};
// ---------------------------- 

// 新增會員---------------------
exports.createMember = async (req, res) => {
    const { member_account, member_password, member_email, member_phone } = req.body;

    // 驗證傳入的資料
    if (!member_account || typeof member_account !== 'string') {
        return res.status(400).send({ message: '使用者帳號 欄位缺少 或 格式錯誤' });
    }

    if (!member_password || typeof member_password !== 'string') {
        return res.status(400).send({ message: '使用者密碼 欄位缺少 或 格式錯誤' });
    }

    if (!member_email || typeof member_email !== 'string') {
        return res.status(400).send({ message: '使用者電子郵件 欄位缺少 或 格式錯誤' });
    }

    if (!member_phone || typeof member_phone !== 'string') {
        return res.status(400).send({ message: '使用者電話 欄位缺少 或 格式錯誤' });
    }

    try {
        // 先檢查資料庫中是否有相同的 member_account
        const existingMember = await new Promise((resolve, reject) => {
            project_memberModel.findByAccount(member_account, (err, member) => {
                if (err) return reject(err);
                resolve(member);
            });
        });

        if (existingMember) {
            return res.status(400).send({ message: '已有相同帳號' });
        }

        // 密碼加密
        const hashedPassword = await hashPassword(member_password);

        // 創建新使用者
        const newMember = { member_account, member_password: hashedPassword, member_email, member_phone };
        const createdMember = await new Promise((resolve, reject) => {
            project_memberModel.createMember(newMember, (err, member) => {
                if (err) return reject(err);
                resolve(member);
            });
        });

        res.status(201).send(createdMember);
    } catch (error) {
        console.error('新增使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 刪除多個---------------------
exports.deleteMoreMembers = (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ message: 'ID 陣列無效或為空' });
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_memberModel.deleteById(ids, (err, result) => {
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
// ----------------------------

// 更新會員資料-----------------
exports.updateMemberData = async (req, res) => {
    const { id } = req.params;
    const updateMember = req.body;
    console.log(req.body);

    // 檢查 ID 是否存在及是否是有效的數字
    if (!id || isNaN(id)) {
        return res.status(400).send({ message: '無效的使用者 ID' });
    }

    // 驗證傳入的資料
    if (updateMember.member_name && typeof updateMember.member_name !== 'string') {
        return res.status(400).send({ message: 'MemberName 欄位格式錯誤' });
    }
    if (updateMember.member_email && typeof updateMember.member_email !== 'string') {
        return res.status(400).send({ message: 'Email 欄位格式錯誤' });
    }
    if (updateMember.member_phone && typeof updateMember.member_phone !== 'string') {
        return res.status(400).send({ message: 'Phone 欄位格式錯誤' });
    }


    try {
        // 呼叫模型中的 updateMemberData 函數
        const result = await project_memberModel.updateMemberData(id, updateMember);

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

// 更新會員密碼-----------------
exports.updateMemberPwd = async (req, res) => {
    const { id } = req.params;
    const updateMember = req.body;

    // 檢查 ID 是否存在 以及 是否是有效的數字
    if (!id || isNaN(id)) {
        return res.status(400).send({ message: '無效的使用者 ID' });
    }

    // 驗證傳入的資料
    if (updateMember.member_password && typeof updateMember.member_password !== 'string') {
        return res.status(400).send({ message: 'Password 欄位格式錯誤' });
    }

    try {
        const updateData = { ...updateMember };

        if (updateData.member_password) {
            // 密碼加密
            updateData.member_password = await hashPassword(updateData.member_password);
        }

        const updatedMember = await new Promise((resolve, reject) => {
            project_memberModel.updateMemberPwd(id, updateData, (err, user) => {
                if (err) return reject(err);
                resolve(user);
            });
        });

        if (!updatedMember) {
            return res.status(404).send({ message: '使用者不存在' });
        }

        res.send(updatedMember);
    } catch (error) {
        console.error('更新使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 上傳頭像---------------------
exports.updateMemberAvatar = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: '請上傳頭像' });
    }
    res.send({ message: '頭像上傳成功', filename: req.file.originalname });
};
// ----------------------------

// 刪除舊頭像-------------------
exports.deleteMemberAvatar = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../img/member/member', filename); // 假設圖檔存放在 ../../vue02/src/assets/img/member/company 目錄中

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("刪除圖檔時發生錯誤:", err);
            return res.status(500).send({ message: '刪除圖檔失敗' });
        }
        res.send({ message: '圖檔刪除成功' });
    });
}
// ----------------------------

// 登入會員---------------------
exports.loginMember = (req, res) => {
    const { member_account, member_password } = req.body;

    // 驗證帳號和密碼是否有傳入
    if (!member_account || !member_password) {
        return res.status(400).send({ message: '請輸入帳號和密碼' });
    }

    project_memberModel.findByAccount(member_account, async (err, member) => {
        if (err) return res.status(500).send({ message: '伺服器錯誤' });

        if (!member) return res.status(400).send({ message: '帳號或密碼錯誤' });

        // 檢查密碼是否正確
        const isMatch = await verifyPassword(member_password, member.member_password);
        if (!isMatch) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }

        // 密碼正確，生成 JWT
        const token = jwt.sign({ id: member.id }, config.jwtSecret, { expiresIn: '1h' });
        console.log(token);

        // 查詢 member_data 表中的資料
        project_memberModel.loginMember(member.id, (err, memberData) => {
            if (err) return res.status(500).send({ message: '伺服器錯誤' });

            // 回傳 token 和 member 資訊
            res.send({
                message: '登入成功',
                token,
                member: {
                    id: member.id,
                    member_account: member.member_account,
                    member_permissions: member.member_permissions,
                    member_data: memberData, // 包含從 member_data 表中獲取的資料
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

        // token 驗證成功，將解碼後的 memberId 存入請求物件
        req.memberId = decoded.id;

        res.send({ message: 'Token 驗證成功', valid: true });
    });
};