const project_orderModel = require('../models/projectModel_orders');

// 取得所有---------------------
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await project_orderModel.getAll(); // 這裡直接使用 async/await
        res.send(orders);
    } catch (err) {
        console.log('錯誤', err);
        res.status(500).send({
            message: '伺服器錯誤'
        });
    }
};
// ----------------------------

// 取得單筆---------------------
exports.getOrderById = async (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    try {
        // 使用 getOne 函式來查詢資料
        const order = await project_orderModel.getOne(id);

        if (!order) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: 'Order 不存在' });
        }

        // 返回找到的使用者
        res.send(order);
    } catch (err) {
        // 如果查詢發生錯誤，返回 500 伺服器錯誤
        console.error('查詢失敗:', err);
        res.status(500).send({ message: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// 取得會員的所有筆訂單----------
exports.getOrderByMemberId = async (req, res) => {
    // 從請求參數中獲取 memberId
    const { memberId } = req.params;

    try {
        // 使用 getOne 函式來查詢資料
        const orders = await project_orderModel.getOrderByMemberId(memberId);

        if (!orders) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: '訂單表 不存在' });
        }

        // 返回找到的使用者
        res.send(orders);
    } catch (err) {
        // 如果查詢發生錯誤，返回 500 伺服器錯誤
        console.error('查詢失敗:', err);
        res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 更新訂單狀態-----------------
exports.updateOrderState = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const id = parseInt(req.params.id, 10);
        const { orderState } = req.body;

        // 驗證請求的參數
        if (isNaN(id) || !orderState || typeof orderState !== 'string') {
            return res.status(400).json({ error: '參數格式無效' });
        }

        // 調用模型中的 updatePermissions 方法
        const updatedOrder = await project_orderModel.updateOrderState(id, orderState);

        if (!updatedOrder) {
            return res.status(404).json({ message: '訂單未找到' }); // 訂單未找到，返回 404
        }

        // 成功更新，返回用戶資料
        res.status(200).json({
            message: '訂單狀態更新成功',
            data: updatedOrder,
        });
    } catch (err) {
        console.error('伺服器錯誤: ', err);
        res.status(500).json({ error: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// 刪除多個---------------------
exports.deleteMoreOrders = async (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ message: 'ID 陣列無效或為空' });
    }

    // 呼叫資料庫模型來刪除多個產品
    try {
        await project_orderModel.deleteById(ids, (err, result) => {
            if (err) {
                console.error('刪除訂單失敗:', err);
                return res.status(500).send({ message: '伺服器錯誤' });
            }

            // 如果 result 是空的，代表沒有使用者被刪除
            if (!result || result.deletedCount === 0) {
                return res.status(404).send({ message: '沒有找到要刪除的訂單' });
            }

            // 返回成功的刪除結果
            res.send({ message: `${result.deletedCount} 個產品已被刪除` });
        });
    } catch (error) {
        console.error('伺服器錯誤:', error);
        return res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 新增產品---------------------
exports.insertShoppingCart = async (req, res) => {
    const { memberId, productId, shop_name, shop_quantity, shop_total, shop_price, shop_img, shop_sweetness, shop_ice, shop_add } = req.body;

    // 驗證傳入的資料
    if (!memberId || typeof memberId !== 'number') {
        return res.status(400).send({ message: '會員ID 欄位缺少 或 格式錯誤' });
    }

    if (!productId || typeof productId !== 'number') {
        return res.status(400).send({ message: '產品ID 欄位缺少 或 格式錯誤' });
    }

    if (!shop_name || typeof shop_name !== 'string') {
        return res.status(400).send({ message: '產品名稱 欄位缺少 或 格式錯誤' });
    }

    if (!shop_quantity || typeof shop_quantity !== 'number') {
        return res.status(400).send({ message: '產品數量 欄位缺少 或 格式錯誤' });
    }

    if (!shop_price || typeof shop_price !== 'string') {
        return res.status(400).send({ message: '產品價格 欄位缺少 或 格式錯誤' });
    }

    if (!shop_total || typeof shop_total !== 'number') {
        return res.status(400).send({ message: '產品總價 欄位缺少 或 格式錯誤' });
    }

    if (!shop_img || typeof shop_img !== 'string') {
        return res.status(400).send({ message: '產品圖片 欄位缺少 或 格式錯誤' });
    }

    if (!shop_sweetness || typeof shop_sweetness !== 'string') {
        return res.status(400).send({ message: '產品甜度 欄位缺少 或 格式錯誤' });
    }

    if (!shop_ice || typeof shop_ice !== 'string') {
        return res.status(400).send({ message: '產品溫度 欄位缺少 或 格式錯誤' });
    }

    try {
        // 創建新產品
        const shoppingCart = { productId, shop_name, shop_quantity, shop_total, shop_price, shop_img, shop_sweetness, shop_ice, shop_add };
        const createdShoppingCart = await project_orderModel.insertShoppingCart(memberId, shoppingCart);

        res.status(201).send(createdShoppingCart);
    } catch (error) {
        console.error('新增購物車失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 查看購物車清單---------------
exports.getShoppingList = async (req, res) => {
    // 從請求參數中獲取 ID
    const { memberId } = req.params;

    try {
        // 使用 getOne 函式來查詢資料
        const shoppingList = await project_orderModel.getShoppingList(memberId);

        if (!shoppingList) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: '購物車清單 不存在' });
        }

        // 返回找到的清單
        res.send(shoppingList);
    } catch (err) {
        // 如果查詢發生錯誤，返回 500 伺服器錯誤
        console.error('查詢失敗:', err);
        res.status(500).send({ message: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// 減少增加產品數量-------------
exports.updateShopQuantity = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const id = parseInt(req.params.id, 10);
        const { shop_quantity } = req.body;

        // 驗證請求的參數
        if (isNaN(id) || !shop_quantity) {
            return res.status(400).json({ error: '參數格式無效' });
        }

        // 調用模型中的 updateShoppingListQuantity 方法
        const updatedOrder = await project_orderModel.updateShoppingListQuantity(id, { shop_quantity });

        if (!updatedOrder) {
            return res.status(404).json({ message: '產品未找到' }); // 產品未找到，返回 404
        }

        // 成功更新，返回用戶資料
        res.status(200).json({
            message: '產品數量更新成功',
            data: updatedOrder,
        });
    } catch (err) {
        console.error('伺服器錯誤: ', err);
        res.status(500).json({ error: '伺服器錯誤', message: err.message });
    }
};
// ----------------------------

// 刪除購物車產品---------------
exports.deleteShoppingProductById = async (req, res) => {
    // 從請求的主體中提取 id
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: '參數格式無效' });
    }

    // 呼叫資料庫模型來刪除多個產品
    try {
        const result = await project_orderModel.deleteShoppingProductById(id);

        if (!result || result.deletedCount === 0) {
            return res.status(404).send({ message: '沒有找到對應的訂單，刪除失敗' });
        }

        res.send({ message: `${result.deletedCount} 個訂單已被刪除` });
    } catch (error) {
        console.error('伺服器錯誤:', error);
        return res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 新增下訂單-------------------
exports.insertOrder = async (req, res) => {
    const memberId = parseInt(req.params.memberId, 10);
    const { order_number, order_total, order_pay } = req.body;

    // 驗證傳入的資料
    if (isNaN(memberId)) {
        return res.status(400).json({ error: '會員ID 欄位缺少 或 格式錯誤' });
    }

    if (!order_number || typeof order_number !== 'string') {
        return res.status(400).send({ message: '訂單編號 欄位缺少 或 格式錯誤' });
    }

    if (!order_total || typeof order_total !== 'number') {
        return res.status(400).send({ message: '訂單總額 欄位缺少 或 格式錯誤' });
    }

    if (!order_pay || typeof order_pay !== 'string') {
        return res.status(400).send({ message: '訂單付款方式 欄位缺少 或 格式錯誤' });
    }

    try {
        // 創建新產品
        const insertOrder = { order_number, order_total, order_pay };
        const createdOrder = await project_orderModel.insertOrder(memberId, insertOrder);

        res.status(201).send(createdOrder);
    } catch (error) {
        console.error('新增訂單失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 取得前 6 筆資料--------------
exports.getOrdersToSix = async (req, res) => {
    try {
        const orders = await project_orderModel.getOrderToSix(); // 這裡直接使用 async/await
        res.send(orders);
    } catch (err) {
        console.log('錯誤', err);
        res.status(500).send({
            message: '伺服器錯誤'
        });
    }
};
// ----------------------------

// 取得前 5 筆熱門商品----------
exports.getHotProduct = async (req, res) => {
    try {
        const hot = await project_orderModel.getHotProduct(); // 這裡直接使用 async/await
        res.send(hot);
    } catch (err) {
        console.log('錯誤', err);
        res.status(500).send({
            message: '伺服器錯誤'
        });
    }
};
// ----------------------------