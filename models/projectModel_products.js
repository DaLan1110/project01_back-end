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
//         console.log('連接成功連接到資料庫 project01_node02 products');
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
        console.log('連接成功連接到資料庫 project01_node02 products');
    } catch (err) {
        console.error('資料庫連接失敗:', err.stack);
    }
}

// 執行檢查
checkConnection();
// ----------------------------

// 取得所有---------------------
function getAll(callback) {
    const query = `
        SELECT product_data.* FROM product_data
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

// 更新上下架-------------------
function updateExhibit(id, updateProduct, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE product_data SET product_exhibit = ? WHERE id = ?';
    const values = [updateProduct.exhibit, id];

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
        pool.query('SELECT * FROM product_data WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}
// ----------------------------

// 新增產品---------------------
function createProduct(newProduct, callback) {
    const query = 'INSERT INTO product_data (product_name, product_price, product_img, product_sweetness, product_ice, product_exhibit, product_add, product_classify, product_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    const productValue = [newProduct.product_name, newProduct.product_price, newProduct.product_img, newProduct.product_sweetness, newProduct.product_ice, newProduct.product_exhibit, newProduct.product_add, newProduct.product_classify, newProduct.product_address]

    // 執行資料庫查詢
    pool.query(query, productValue, (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 將結果返回給回調函數
        callback(null, { ...newProduct, product_id: results.insertId });
    });
}
// ----------------------------

// 檢查是否有相同產品
function findByProduct(product_name, callback) {
    const query = 'SELECT * FROM product_data WHERE product_name = ? LIMIT 1';

    // 執行資料庫查詢
    pool.query(query, [product_name], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length > 0) {
            // 找到相同的帳號，返回第一筆資料
            callback(null, results[0]);
        } else {
            // 沒有找到相同的帳號
            callback(null, null);
        }
    });
}
// ----------------------------

// 取得單筆資料-----------------
function getOne(id, callback) {
    const query = 'SELECT * FROM product_data WHERE id = ?';

    // 執行資料庫查詢
    pool.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 如果找不到記錄，返回 null
        if (results.length === 0) {
            return callback(null, null);
        }
        // 返回結果，包含 user_data 和 useraccount 的資料
        callback(null, results[0]);
    });
}
// ----------------------------

// 刪除多個---------------------
function deleteById(ids, callback) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return callback(new Error('無效的使用者 ID 或是 空的 ID 陣列'), null);
    }

    // 刪除 product_data 表中的記錄
    const deleteProductDataQuery = 'DELETE FROM product_data WHERE id IN (?)';
    pool.query(deleteProductDataQuery, [ids], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 返回成功刪除的結果
        callback(null, { deletedCount: results.affectedRows });
    });
}
// ----------------------------

// 更新產品資料-----------------
function updateProductData(id, updateProduct) {
    return new Promise((resolve, reject) => {
        // 更新 user_data 表中的 user_avatar 和 username
        let queryUpdateProductData = 'UPDATE product_data SET product_name = ?, product_price = ?, product_img = ?, product_sweetness = ?, product_ice = ?, product_exhibit = ?, product_add = ?, product_classify = ?, product_address = ? WHERE id = ?';
        const valuesProductData = [updateProduct.product_name, updateProduct.product_price, updateProduct.product_img, updateProduct.product_sweetness, updateProduct.product_ice, updateProduct.product_exhibit, updateProduct.product_add, updateProduct.product_classify, updateProduct.product_address, id];

        pool.query(queryUpdateProductData, valuesProductData, (err, results) => {
            if (err) {
                console.error('更新 product_data 表錯誤: ', err);
                return reject(err); // 觸發拒絕
            }

            if (results.affectedRows === 0) {
                return resolve(null); // 沒有行被更新
            }

            // 查詢更新後的資料
            pool.query(
                'SELECT * FROM product_data WHERE id = ?',
                [id], // 使用 id
                (err, results) => {
                    if (err) {
                        return reject(err); // 觸發拒絕
                    }
                    resolve(results[0]); // 返回更新後的資料
                }
            );
        });
    });
}
// ----------------------------


module.exports = {
    // 取得所有
    getAll,
    // 取得單筆
    getOne,
    // 更新上下架
    updateExhibit,
    // 新增產品
    createProduct, findByProduct,
    // 更新產品資料
    updateProductData,
    // 刪除產品資料
    deleteById,
}