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
//         console.log('連接成功連接到資料庫 project01_node02 joinUs');
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
        console.log('連接成功連接到資料庫 project01_node02 joinUs');
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
        SELECT * FROM join_us_data
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

// 取得單筆資料 ----------------
function getOne(id, callback) {
    const query = `
        SELECT *
        FROM join_us_data
        WHERE id = ?`;

    // 執行資料庫查詢
    pool.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 如果找不到記錄，返回 null
        if (results.length === 0) {
            return callback(null, null);
        }
        // 返回結果，包含 join_us_data 的資料
        callback(null, results[0]);
    });
}
// ----------------------------

// 新增地址---------------------
function createJoinUs(newJoinUs, callback) {
    const query = 'INSERT INTO join_us_data (join_us_name, join_us_phone, join_us_email, join_us_address, join_us_permissions) VALUES (?, ?, ?, ?, \'false\')';

    // 執行資料庫查詢
    pool.query(query, [newJoinUs.join_us_name, newJoinUs.join_us_phone, newJoinUs.join_us_email, newJoinUs.join_us_address], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 將結果返回給回調函數
        callback(null, results);
    });
}
// ----------------------------

// 檢查是否有相同地址 -----------
function findByAddress(address, callback) {
    const query = 'SELECT * FROM join_us_data WHERE join_us_address = ? LIMIT 1';

    // 執行資料庫查詢
    pool.query(query, [address], (err, results) => {
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

// 檢查是否有相同地址排除自己 ---
function findByAddressToId(address, id, callback) {
    const query = 'SELECT * FROM join_us_data WHERE join_us_address = ? AND id != ? LIMIT 1';

    // 執行資料庫查詢
    pool.query(query, [address, id], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length > 0) {
            // 找到相同的地址（但不是自己），返回第一筆資料
            callback(null, results[0]);
        } else {
            // 沒有找到相同的地址
            callback(null, null);
        }
    });
}
// ----------------------------

// 刪除多個 --------------------
function deleteMoreById(ids, callback) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return callback(new Error('無效的加入者 ID 或是 空的 ID 陣列'), null);
    }

    // 首先根據 member_data 的 id 刪除對應的記錄，並且獲取對應的 memberId
    const deleteJoinUsDataQuery = 'DELETE FROM join_us_data WHERE id IN (?)';
    pool.query(deleteJoinUsDataQuery, [ids], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 返回成功刪除的結果
        callback(null, { deletedCount: results.affectedRows });
    });
}
// ----------------------------

// 刪除單一 --------------------
function deleteById(id, callback) {
    // 檢查 id 是否為有效數字
    if (!id || isNaN(id)) {
        return callback(new Error('無效的加入者 ID'), null);
    }

    const deleteJoinUs = `DELETE FROM join_us_data WHERE id = ? `

    // 刪除 join_us_data 表中的記錄
    pool.query(deleteJoinUs, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 檢查是否有刪除任何記錄
        if (results.affectedRows === 0) {
            return callback(new Error('找不到該 ID 對應的加入者'), null);
        }

        // 返回成功刪除的結果
        callback(null, { deletedCount: results.affectedRows });
    });
}
// ----------------------------

// 更新加入者資料---------------
function updateJoinUsData(id, updateJoinUs) {
    return new Promise((resolve, reject) => {
        // 更新 user_data 表中的 user_avatar 和 username
        let queryUpdateJoinUsData = 'UPDATE join_us_data SET join_us_name = ?, join_us_phone = ?, join_us_email = ?, join_us_address = ? WHERE id = ?';
        const valuesJoinUsData = [updateJoinUs.join_us_name, updateJoinUs.join_us_phone, updateJoinUs.join_us_email, updateJoinUs.join_us_address, id];

        pool.query(queryUpdateJoinUsData, valuesJoinUsData, (err, results) => {
            if (err) {
                console.error('更新 join_us_data 表錯誤: ', err);
                return reject(err); // 觸發拒絕
            }

            if (results.affectedRows === 0) {
                return resolve(null); // 沒有行被更新
            }

            // 查詢更新後的資料
            pool.query(
                'SELECT * FROM join_us_data WHERE id = ?',
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

// 更新權限---------------------
function updatePermissions(id, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE join_us_data SET join_us_permissions = ? WHERE id = ?';
    const values = ['true', id];

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
        pool.query('SELECT * FROM join_us_data WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}
// ----------------------------

module.exports = {
    // 取得所有
    getAll,
    // 取得單筆
    getOne,
    // 檢查是否有相同地址
    findByAddress,
    // 新增地址
    createJoinUs,
    // 檢查是否有相同地址
    findByAddress,
    // 檢查是否有相同地址排除自己
    findByAddressToId,
    // 刪除多個
    deleteMoreById,
    // 刪除單一
    deleteById,
    // 更新加入者資料
    updateJoinUsData,
    // 更新權限
    updatePermissions,
}