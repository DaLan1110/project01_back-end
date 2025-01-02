const project_joinUsModel = require('../models/projectModel_joinUs');

// 取得所有---------------------
exports.getAllJoinUs = (req, res) => {
    project_joinUsModel.getAll((err, joinUs) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(joinUs)
    })
}
// ----------------------------

// 取得單筆---------------------
exports.getJoinUsById = (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    // 調用 project_joinUsModel 的 getOne 函數
    project_joinUsModel.getOne(id, (err, joinUs) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!joinUs) {
            // 如果找不到，返回 404 未找到
            return res.status(404).send({ message: '加入表單 不存在' });
        }

        // 返回找到的使用者
        res.send(joinUs);
    });
};
// ----------------------------

// 新增加入者-------------------
exports.createJoinUs = async (req, res) => {
    const { join_us_name, join_us_phone, join_us_email, join_us_address } = req.body;

    // 驗證傳入的資料
    if (!join_us_name || typeof join_us_name !== 'string') {
        return res.status(400).send({ message: '加入者名稱 欄位缺少 或 格式錯誤' });
    }

    if (!join_us_phone || typeof join_us_phone !== 'string') {
        return res.status(400).send({ message: '加入者電話 欄位缺少 或 格式錯誤' });
    }

    if (!join_us_email || typeof join_us_email !== 'string') {
        return res.status(400).send({ message: '加入者電子郵件 欄位缺少 或 格式錯誤' });
    }

    if (!join_us_address || typeof join_us_address !== 'string') {
        return res.status(400).send({ message: '加入者地址 欄位缺少 或 格式錯誤' });
    }

    try {
        // 先檢查資料庫中是否有相同的 join_us_address
        const existingJoinUs = await new Promise((resolve, reject) => {
            project_joinUsModel.findByAddress(join_us_address, (err, joinUs) => {
                if (err) return reject(err);
                resolve(joinUs);
            });
        });

        if (existingJoinUs) {
            return res.status(400).send({ message: '已有相同地址' });
        }

        const newJoinUs = { join_us_name, join_us_phone, join_us_email, join_us_address };
        const createdJoinUs = await new Promise((resolve, reject) => {
            project_joinUsModel.createJoinUs(newJoinUs, (err, joinUs) => {
                if (err) return reject(err);
                resolve(joinUs);
            });
        });

        res.status(201).send(createdJoinUs);
    } catch (error) {
        console.error('新增使用者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 刪除多個 --------------------
exports.deleteMoreJoinUs = (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ message: 'ID 陣列無效或為空' });
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_joinUsModel.deleteMoreById(ids, (err, result) => {
        if (err) {
            console.error('刪除加入者失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 如果 result 是空的，代表沒有使用者被刪除
        if (!result || result.deletedCount === 0) {
            return res.status(404).send({ message: '沒有找到要刪除的加入者' });
        }

        // 返回成功的刪除結果
        res.send({ message: `${result.deletedCount} 位加入者已被刪除` });
    });
};
// ----------------------------

// 刪除單一 --------------------
exports.deleteJoinUsById = (req, res) => {
    // 從請求的主體中提取 id
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_joinUsModel.deleteById(id, (err, result) => {
        if (err) {
            console.error('刪除訂單失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 檢查是否成功刪除
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '沒有找到對應的加入者，刪除失敗' }); // 資料未找到，返回 404
        }

        // 成功刪除，返回刪除的數量
        res.status(200).json({ message: `${result.deletedCount} 加入者已被成功刪除` }); // 返回刪除成功訊息，狀態碼 200
    });
};
// ----------------------------

// 更新加入者資料---------------
exports.updateJoinUsData = async (req, res) => {
    const { id } = req.params;
    const updateJoinUs = req.body;
    console.log(req.body);

    // 檢查 ID 是否存在及是否是有效的數字
    if (!id || isNaN(id)) {
        return res.status(400).send({ message: '無效的使用者 ID' });
    }

    // 驗證傳入的資料
    if (updateJoinUs.join_us_name && typeof updateJoinUs.join_us_name !== 'string') {
        return res.status(400).send({ message: 'JoinUsName 欄位格式錯誤' });
    }
    if (updateJoinUs.join_us_phone && typeof updateJoinUs.join_us_phone !== 'string') {
        return res.status(400).send({ message: 'Email 欄位格式錯誤' });
    }
    if (updateJoinUs.join_us_email && typeof updateJoinUs.join_us_email !== 'string') {
        return res.status(400).send({ message: 'Phone 欄位格式錯誤' });
    }
    if (updateJoinUs.join_us_address && typeof updateJoinUs.join_us_address !== 'string') {
        return res.status(400).send({ message: 'Address 欄位格式錯誤' });
    }


    try {
        // 先檢查資料庫中是否有相同的 join_us_address
        const existingJoinUs = await new Promise((resolve, reject) => {
            project_joinUsModel.findByAddressToId(updateJoinUs.join_us_address, id, (err, joinUs) => {
                if (err) return reject(err);
                resolve(joinUs);
            });
        });

        if (existingJoinUs) {
            return res.status(400).send({ message: '已有相同地址' });
        }
        // 呼叫模型中的 updateJoinUsData 函數
        const result = await project_joinUsModel.updateJoinUsData(id, updateJoinUs);

        if (!result) {
            return res.status(404).send({ message: '找不到加入者資料' });
        }

        res.send({ message: '更新成功', data: result });
    } catch (err) {
        console.error('更新失敗:', err);
        res.status(500).send({ message: '更新失敗', error: err.message });
    }
};
// ----------------------------

// 更新權限---------------------
exports.updateJoinUsPermissions = async (req, res) => {
    try {
        // 從請求的主體中提取 id
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
        }

        // 調用 updatePermissions 函數
        project_joinUsModel.updatePermissions(id, (err, updatedJoinUs) => {
            if (err) {
                return res.status(500).json({ error: '更新同意權限時出錯' }); // 伺服器錯誤，返回 500
            }

            if (!updatedJoinUs) {
                return res.status(404).json({ message: '加入者未找到' }); // 資料未找到，返回 404
            }

            // 成功更新，用戶資料
            res.status(200).json(updatedJoinUs); // 返回更新後的用戶資料，狀態碼 200
        });
    } catch (error) {
        // 捕獲並處理任何其他異常錯誤
        console.error('伺服器錯誤: ', error);
        res.status(500).json({ error: '伺服器錯誤' }); // 伺服器錯誤，返回 500
    }
};
// ---------------------------- 