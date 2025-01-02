// const mysql = require('mysql2');

// // 建立連線--------------------
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '2XuxgdrX318056!DaLan@',
//     database: 'project01_node02'
// })

// // 取得連接池的 Promise 物件
// const promisePool = pool.promise();

// // 驗證連接池是否正常工作
// async function checkConnection() {
//     try {
//         // 試著進行一次簡單的查詢
//         await promisePool.query('SELECT 1');
//         console.log('連接成功連接到資料庫 project01_node02 orders');
//     } catch (err) {
//         console.error('連接池連接失敗 project01_node02: ', err.stack);
//     }
// }
// // 執行檢查
// checkConnection();
// // ----------------------------

const Sequelize = require('sequelize');
const process = require('process');
const path = require('path');

// 這裡假設 `config.js` 存放在 `config` 資料夾下
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// 引用 config 設定檔案
const config = require(path.join(__dirname, '../config.js'))[env];

const db = {};
let sequelize;

// 判斷是否有 DATABASE_URL 環境變數，若有則使用 DATABASE_URL
if (process.env.DATABASE_URL) {
    // 這裡 DATABASE_URL 是完整的資料庫連線字串
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // 若使用 SSL 證書連接
            }
        }
    });
} else {
    // 若沒有 DATABASE_URL，則使用 config.js 檔案中的資料庫設定
    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: 'postgres',
        port: config.port,
        logging: false, // 關閉查詢日誌輸出
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // 若需要使用 SSL 證書
            }
        }
    });
}

// 驗證連接池是否正常工作
async function checkConnection() {
    try {
        // 測試簡單的查詢
        await sequelize.authenticate();
        console.log('連接成功連接到資料庫 project01_node02 orders');
    } catch (err) {
        console.error('資料庫連接失敗:', err.stack);
    }
}

// 執行檢查
checkConnection();
// ----------------------------

// 取得所有---------------------
function getAll(callback) {
    // SELECT order_data.*, member_data.member_name, memberaccount.member_account, shopping_list.* FROM order_data 
    // LEFT JOIN member_data ON order_data.memberId = member_data.id 
    // LEFT JOIN memberaccount ON member_data.memberId = memberaccount.id 
    // LEFT JOIN shopping_list ON order_data.id = shopping_list.orderId
    const query = `
        SELECT order_data.*, member_data.member_name, memberaccount.member_account FROM order_data 
        LEFT JOIN member_data ON order_data.memberId = member_data.id 
        LEFT JOIN memberaccount ON member_data.memberId = memberaccount.id 
    `;
    pool.query(query, (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}
// ----------------------------

// 取得單筆資料-----------------
function getOne(id, callback) {
    const query = `
        SELECT order_data.*, member_data.member_name, memberaccount.member_account FROM order_data 
        LEFT JOIN member_data ON order_data.memberId = member_data.memberId 
        LEFT JOIN memberaccount ON member_data.memberId = memberaccount.id 
        WHERE order_data.id = ?`;

    // 執行資料庫查詢
    pool.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 如果找不到記錄，返回 null
        if (results.length === 0) {
            return callback(null, null);
        }

        // 查詢的資料
        const orderData = results[0]; // 取得訂單的基本資料

        // 查詢 shopping_list 資料
        const queryShopData = `SELECT * FROM shopping_list WHERE orderId = ?`;
        pool.query(queryShopData, [id], (err, shopResults) => {
            if (err) {
                return callback(err, null); // 錯誤處理
            }

            // 將訂單資料和購物清單合併
            orderData.shoppingList = shopResults;

            // 返回最終結果
            return callback(null, orderData);
        });
    });
}
// ----------------------------

// 取得會員的所有筆訂單----------
function getOrderByMemberId(memberId, callback) {
    const query =
        `SELECT * FROM order_data WHERE order_data.memberId = ?`;

    // 執行資料庫查詢
    pool.query(query, [memberId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 如果沒有找到記錄，返回空陣列
        if (results.length === 0) {
            return callback(null, []); // 返回空陣列代表沒有資料
        }

        // 返回最終結果
        return callback(null, results);
    });
}
// ----------------------------

// 更新訂單狀態-----------------
function updateOrderState(id, updateOrder, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE order_data SET order_state = ? WHERE id = ?';
    const values = [updateOrder.orderState, id];

    // 執行資料庫查詢
    pool.query(query, values, (err, results) => {
        if (err) {
            console.error('資料庫查詢錯誤: ', err); // 顯示具體的錯誤信息
            return callback(err, null);
        }

        // 檢查是否有行被更新
        if (results.affectedRows === 0) {
            return callback(null, null); // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的待辦事項
        pool.query('SELECT * FROM order_data WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}
// ----------------------------

// 刪除多個---------------------
function deleteById(ids, callback) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return callback(new Error('無效的使用者 ID 或是 空的 ID 陣列'), null);
    }

    const deleteShoppingListQuery = `DELETE shopping_list 
        FROM shopping_list 
        JOIN order_data ON shopping_list.orderId = order_data.id
        WHERE order_data.id IN(?)`

    pool.query(deleteShoppingListQuery, [ids], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 刪除 product_data 表中的記錄
        const deleteOrderDataQuery = 'DELETE FROM order_data WHERE id IN (?)';
        pool.query(deleteOrderDataQuery, [ids], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            // 返回成功刪除的結果
            callback(null, { deletedCount: results.affectedRows });
        });

    });
}
// ----------------------------

// 產品加入購物車---------------
function insertShoppingCart(memberId, shoppingCart, callback) {
    const query = 'INSERT INTO shopping_list (memberId, productId, shop_name, shop_quantity, shop_total, shop_price, shop_img, shop_sweetness, shop_ice, shop_add) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    // 執行資料庫查詢
    pool.query(query, [memberId, shoppingCart.productId, shoppingCart.shop_name, shoppingCart.shop_quantity, shoppingCart.shop_total, shoppingCart.shop_price, shoppingCart.shop_img, shoppingCart.shop_sweetness, shoppingCart.shop_ice, shoppingCart.shop_add], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, results);
    });
}
// ----------------------------

// 查看購物車清單---------------
function getShoppingList(memberId, callback) {
    const query = 'SELECT * FROM shopping_list WHERE memberId = ? AND orderId IS NULL';

    // 執行資料庫查詢
    pool.query(query, [memberId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 如果沒有找到記錄，返回空陣列
        if (results.length === 0) {
            return callback(null, []); // 返回空陣列代表沒有資料
        }

        callback(null, results);
    });
}
// ----------------------------

// 更新減少增加產品數量-------------
function updateShoppingListQuantity(id, updateQuantity, callback) {
    const query = 'UPDATE shopping_list SET shop_quantity = ? WHERE id = ?';
    const updateShopQuantity = [updateQuantity.shop_quantity, id]
    // 執行資料庫查詢
    pool.query(query, updateShopQuantity, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 檢查是否有行受到影響
        if (results.affectedRows === 0) {
            // 如果沒有更新任何行，返回 null
            return callback(null, null);
        }

        // 如果成功更新 shop_quantity，繼續更新 shop_total
        const updateTotalQuery = `
            UPDATE shopping_list
            SET shop_total = shop_quantity * shop_price
            WHERE id = ?
        `;
        const updateTotalParams = [id];

        pool.query(updateTotalQuery, updateTotalParams, (err, totalUpdateResults) => {
            if (err) {
                return callback(err, null); // 返回錯誤
            }

            // 返回更新後的結果
            callback(null, totalUpdateResults);
        });
    });
}
// ----------------------------

// 刪除購物車產品---------------
function deleteShoppingProductById(id, callback) {
    // 檢查 id 是否為有效數字
    if (!id || isNaN(id)) {
        return callback(new Error('無效的使用者 ID'), null);
    }

    const deleteShoppingProduct = `DELETE FROM shopping_list WHERE id = ? `

    // 刪除 shopping_list 表中的記錄
    pool.query(deleteShoppingProduct, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 檢查是否有刪除任何記錄
        if (results.affectedRows === 0) {
            return callback(new Error('找不到該 ID 對應的產品'), null);
        }

        // 返回成功刪除的結果
        callback(null, { deletedCount: results.affectedRows });
    });
}
// ----------------------------

// 新增下訂單-------------------
function insertOrder(memberId, order, callback) {
    const query = 'INSERT INTO order_data (memberId, order_number, order_state, order_total, order_pay) VALUES (?, ?, ?, ?, ?)';

    // 執行資料庫查詢
    pool.query(query, [memberId, order.order_number, "待核款", order.order_total, order.order_pay], (err, results) => {
        if (err) {
            console.error('order_data 新增錯誤:', err); // 記錄錯誤
            return callback(err, null);
        }

        const insertedOrderId = results.insertId; // 獲取剛插入的訂單 ID

        // 更新 shopping_list，符合條件的記錄將 orderId 更新為插入的訂單 ID
        const updateShoppingListQuery = `
         UPDATE shopping_list
         SET orderId = ?
         WHERE memberId = ? AND orderId IS NULL
     `;
        const updateShoppingListParams = [insertedOrderId, memberId];

        pool.query(updateShoppingListQuery, updateShoppingListParams, (err, updateResults) => {
            if (err) {
                console.error('shopping_list 更新錯誤:', err); // 記錄錯誤
                return callback(err, null); // 返回錯誤
            }

            // 返回更新結果
            callback(null, { message: '下訂單成功', updatedRows: updateResults.affectedRows });
        });
    });
}
// ----------------------------

// 取得前 6 筆資料--------------
function getOrderToSix(callback) {
    const query = `
        (SELECT * FROM order_data WHERE order_state = '待核款' ORDER BY create_at ASC LIMIT 6) 
        UNION ALL
        (SELECT * FROM order_data WHERE order_state = '未付款' ORDER BY create_at ASC LIMIT 6)
        ORDER BY create_at ASC LIMIT 6
    `;
    pool.query(query, (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}
// ----------------------------

// 取得前 5 筆熱門商品----------
function getHotProduct(callback) {
    const query = `
        SELECT productId, shop_name, COUNT(*) AS count 
        FROM shopping_list
        GROUP BY productId, shop_name
        ORDER BY count DESC
        LIMIT 5;
    `;
    pool.query(query, (err, results) => {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}
// ----------------------------



module.exports = {
    // 取得所有
    getAll,
    // 取得單筆
    getOne,
    // 取得會員的所有筆訂單
    getOrderByMemberId,
    // 更新訂單狀態
    updateOrderState,
    // 刪除訂單資料
    deleteById,
    // 產品加入購物車
    insertShoppingCart,
    // 查看購物車清單
    getShoppingList,
    // 更新減少增加產品數量
    updateShoppingListQuantity,
    // 刪除購物車產品
    deleteShoppingProductById,
    // 新增下訂單
    insertOrder,
    // 取得前 6 筆資料
    getOrderToSix,
    // 取得前 5 筆熱門商品
    getHotProduct,
}