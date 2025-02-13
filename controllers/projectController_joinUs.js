const project_joinUsModel = require('../models/projectModel_joinUs');

// 取得所有---------------------
exports.getAllJoinUs = async (req, res) => {
    try {
        const joins = await project_joinUsModel.getAll(); // 這裡直接使用 async/await
        res.send(joins);
    } catch (err) {
        console.log('錯誤', err);
        res.status(500).send({
            message: '伺服器錯誤'
        });
    }
};
// ----------------------------

// 取得單筆---------------------
exports.getJoinUsById = async (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    try {
        // 使用 getOne 函式來查詢資料
        const join = await project_joinUsModel.getOne(id);

        if (!join) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: 'Join 不存在' });
        }

        // 返回找到的使用者
        res.send(join);
    } catch (err) {
        // 如果查詢發生錯誤，返回 500 伺服器錯誤
        console.error('查詢失敗:', err);
        res.status(500).send({ message: '伺服器錯誤' });
    }
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
        // 先檢查資料庫中是否有相同的 join_us_data
        const existingJoinUs = await project_joinUsModel.findByAddress(join_us_address);

        if (existingJoinUs) {
            return res.status(400).send({ message: '已有相同地址' });
        }

        // 創建新地址
        const newJoinUs = { join_us_name, join_us_phone, join_us_email, join_us_address };
        const createdJoinUs = await project_joinUsModel.createJoinUs(newJoinUs);

        res.status(201).send(createdJoinUs);
    } catch (error) {
        console.error('新增加入者失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 刪除多個---------------------
exports.deleteMoreJoinUs = async (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'ID 陣列無效或為空' });
    }

    try {
        // 呼叫 Sequelize 的模型來刪除多筆記錄
        const deletedCount = await project_joinUsModel.deleteMoreById(ids);

        // 檢查是否刪除了記錄
        if (deletedCount === 0) {
            return res.status(404).json({ message: '沒有找到要刪除的加入者' });
        }

        // 返回成功的刪除結果
        res.status(200).json({ message: `已成功刪除 ${deletedCount} 位加入者` });
    } catch (error) {
        console.error('刪除加入者失敗:', error); // 記錄伺服器錯誤
        res.status(500).json({ message: '伺服器錯誤' }); // 返回伺服器錯誤
    }
};
// ----------------------------

// 刪除單一 --------------------
exports.deleteJoinUsById = async (req, res) => {
    // 從請求的參數中提取 id
    const { id } = req.params;

    // 檢查是否有提供 id
    if (!id) {
        return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
    }

    try {
        // 呼叫 Sequelize 的模型來刪除記錄
        const deletedCount = await project_joinUsModel.deleteById(id);

        // 檢查是否成功刪除
        if (deletedCount === 0) {
            return res.status(404).json({ message: '沒有找到對應的加入者，刪除失敗' }); // 資料未找到，返回 404
        }

        // 成功刪除，返回刪除的數量
        res.status(200).json({ message: '加入者已被成功刪除' }); // 返回刪除成功訊息，狀態碼 200
    } catch (err) {
        console.error('刪除加入者失敗:', err); // 記錄伺服器錯誤
        res.status(500).json({ message: '伺服器錯誤' }); // 返回伺服器錯誤
    }
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
        // 先檢查資料庫中是否有相同的 join_us_data
        const existingJoinUs = await project_joinUsModel.findByAddressToId(updateJoinUs.join_us_address, id);

        if (existingJoinUs) {
            return res.status(400).send({ message: '已有相同地址' });
        }

        // 呼叫模型中的 updateProductData 函數
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
        const id = parseInt(req.params.id, 10);

        // 驗證請求的參數
        if (isNaN(id)) {
            return res.status(400).json({ error: '參數格式無效' });
        }

        // 調用模型中的 updatePermissions 方法
        const updatedJoinUs = await project_joinUsModel.updatePermissions(id);

        if (!updatedJoinUs) {
            return res.status(404).json({ message: '加入者未找到' }); // 加入者未找到，返回 404
        }

        // 成功更新，返回用戶資料
        res.status(200).json({
            message: '權限更新成功',
            data: updatedJoinUs,
        });
    } catch (err) {
        console.error('伺服器錯誤: ', err);
        res.status(500).json({ error: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------