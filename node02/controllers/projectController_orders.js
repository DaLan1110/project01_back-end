const project_orderModel = require('../models/projectModel_orders');

// 取得所有---------------------
exports.getAllOrders = (req, res) => {
    project_orderModel.getAll((err, orders) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(orders)
    })
}
// ----------------------------

// 取得單筆---------------------
exports.getOrderById = (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    // 調用 model 的 getOne 函數
    project_orderModel.getOne(id, (err, order) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!order) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: '訂單 不存在' });
        }

        // 返回找到的使用者
        res.send(order);
    });
};
// ----------------------------

// 取得會員的所有筆訂單----------
exports.getOrderByMemberId = (req, res) => {
    // 從請求參數中獲取 memberId
    const { memberId } = req.params;

    // 調用 model 的 getOrderByMemberId 函數
    project_orderModel.getOrderByMemberId(memberId, (err, order) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!order) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: '訂單表 不存在' });
        }

        // 返回找到的使用者
        res.send(order);
    });
};
// ----------------------------

// 更新訂單狀態-----------------
exports.updateOrderState = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const { id } = req.params;
        const { orderState } = req.body;

        if (!id || !orderState) {
            return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
        }

        // 調用 updateOrderState 函數
        project_orderModel.updateOrderState(id, { orderState }, (err, updatedOrder) => {
            if (err) {
                return res.status(500).json({ error: '更新用戶權限時出錯' }); // 伺服器錯誤，返回 500
            }

            if (!updatedOrder) {
                return res.status(404).json({ message: '用戶未找到' }); // 資料未找到，返回 404
            }

            // 成功更新，用戶資料
            res.status(200).json(updatedOrder); // 返回更新後的用戶資料，狀態碼 200
        });
    } catch (error) {
        // 捕獲並處理任何其他異常錯誤
        console.error('伺服器錯誤: ', error);
        res.status(500).json({ error: '伺服器錯誤' }); // 伺服器錯誤，返回 500
    }
};
// ---------------------------- 

// 刪除多個---------------------
exports.deleteMoreOrders = (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ message: 'ID 陣列無效或為空' });
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_orderModel.deleteById(ids, (err, result) => {
        if (err) {
            console.error('刪除訂單失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 如果 result 是空的，代表沒有使用者被刪除
        if (!result || result.deletedCount === 0) {
            return res.status(404).send({ message: '沒有找到要刪除的訂單' });
        }

        // 返回成功的刪除結果
        res.send({ message: `${result.deletedCount} 訂單已被刪除` });
    });
};
// ----------------------------

// 產品加入購物車---------------
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
        // 創建購物車
        const shoppingCart = { productId, shop_name, shop_quantity, shop_total, shop_price, shop_img, shop_sweetness, shop_ice, shop_add };
        const createdShoppingCart = await new Promise((resolve, reject) => {
            project_orderModel.insertShoppingCart(memberId, shoppingCart, (err, shoppingList) => {
                if (err) return reject(err);
                console.log(memberId)
                resolve(shoppingList);
            });
        });

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

    // 調用 model 的 getOne 函數
    project_orderModel.getShoppingList(memberId, (err, shoppingList) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (shoppingList === null) {
            return res.status(404).send({ message: '沒有找到購物車清單' });
        }

        // 返回找到的使用者
        res.send(shoppingList);
    });
}
// ----------------------------

// 減少增加產品數量-------------
exports.updateShopQuantity = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const { id } = req.params;
        const { shop_quantity } = req.body;

        if (!id || !shop_quantity) {
            return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
        }

        // 調用 updateExhibit 函數
        project_orderModel.updateShoppingListQuantity(id, { shop_quantity }, (err, updateShopQuantity) => {
            if (err) {
                return res.status(500).json({ error: '更新產品數量出錯' }); // 伺服器錯誤，返回 500
            }

            if (!updateShopQuantity) {
                return res.status(404).json({ message: '產品數量更新成功', data: updateShopQuantity }); // 資料未找到，返回 404
            }

            // 成功更新，用戶資料
            res.status(200).json(updateShopQuantity); // 返回更新後的產品資料，狀態碼 200
        });
    } catch (error) {
        // 捕獲並處理任何其他異常錯誤
        console.error('伺服器錯誤: ', error);
        res.status(500).json({ error: '伺服器錯誤' }); // 伺服器錯誤，返回 500
    }
};
// ----------------------------

// 刪除購物車產品---------------
exports.deleteShoppingProductById = (req, res) => {
    // 從請求的主體中提取 id
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_orderModel.deleteShoppingProductById(id, (err, result) => {
        if (err) {
            console.error('刪除訂單失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 檢查是否成功刪除
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '沒有找到對應的訂單，刪除失敗' }); // 資料未找到，返回 404
        }

        // 成功刪除，返回刪除的數量
        res.status(200).json({ message: `${result.deletedCount} 訂單已被成功刪除` }); // 返回刪除成功訊息，狀態碼 200
    });
};
// ----------------------------

// 新增下訂單-------------------
exports.insertOrder = async (req, res) => {
    const { memberId } = req.params;
    const { order_number, order_total, order_pay } = req.body;

    // 驗證傳入的資料
    if (!memberId || isNaN(Number(memberId))) {
        return res.status(400).send({ message: '會員ID 欄位缺少 或 格式錯誤' });
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
        // 創建訂單
        const insertOrder = { order_number, order_total, order_pay };
        const createdOrder = await new Promise((resolve, reject) => {
            project_orderModel.insertOrder(memberId, insertOrder, (err, order) => {
                if (err) {
                    return reject(err); // 返回錯誤
                }
                resolve(order); // 返回插入成功的結果
            });
        });

        res.status(201).send({
            message: '訂單新增成功',
            data: createdOrder,
        });
    } catch (error) {
        console.error('新增訂單失敗:', error);
        res.status(500).send({ message: '伺服器錯誤', error: error.message });
    }
}
// ----------------------------

// 取得前 6 筆資料--------------
exports.getOrdersToSix = (req, res) => {
    project_orderModel.getOrderToSix((err, orders) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(orders)
    })
}
// ----------------------------

// 取得前 5 筆熱門商品----------
exports.getHotProduct = (req, res) => {
    project_orderModel.getHotProduct((err, hot) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(hot)
    })
}
// ----------------------------