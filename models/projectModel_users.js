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
//         console.log('連接成功連接到資料庫 project01_node02 users');
//     } catch (err) {
//         console.error('連接池連接失敗 project01_node02: ', err.stack);
//     }
// }
// // 執行檢查
// checkConnection();
// // ----------------------------

// const { Pool } = require('pg');

// // 建立連線--------------------
// const pool = new Pool({
//     host: 'dpg-ctovcmlsvqrc73bbnafg-a.singapore-postgres.render.com',
//     user: 'root', // PostgreSQL 預設用戶是 'postgres'
//     password: 'OIsqdeOnTxiiRga3ShXjh0mFy4QNZ6fO', // 替換成 PostgreSQL 資料庫的密碼
//     database: 'project01_node02_5jet', // 替換成你的 PostgreSQL 資料庫名稱
//     port: 5432, // PostgreSQL 預設連接埠是 5432
// });

// // 驗證連接池是否正常工作
// async function checkConnection() {
//     try {
//         // 試著進行一次簡單的查詢
//         const res = await pool.query('SELECT 1');
//         console.log('連接成功連接到資料庫 project01_node02');
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
            // ssl: {
            //     require: true,
            //     rejectUnauthorized: false, // 若需要使用 SSL 證書
            // }
        }
    });
}

// 驗證連接池是否正常工作
async function checkConnection() {
    try {
        // 測試簡單的查詢
        await sequelize.authenticate();
        console.log('連接成功連接到資料庫 project01_node02 users');
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
        SELECT useraccount.*, user_data.* 
        FROM useraccount
        LEFT JOIN user_data ON useraccount.id = user_data.userId
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

// 取得單一---------------------
// function getOne(id, callback) {
//     const query = 'SELECT * FROM useraccount WHERE ID = ?';

//     // 執行資料庫查詢
//     pool.query(query, [id], (err, results) => {
//         if (err) {
//             return callback(err, null);
//         }
//         // 如果找不到記錄，返回 null
//         if (results.length === 0) {
//             return callback(null, null);
//         }
//         // 將第一筆結果返回給回調函數
//         callback(null, results[0]);
//     });
// }
// ----------------------------

// 新增------------------------
// function create(newUser, callback) {
//     const query = 'INSERT INTO useraccount (user_account, user_password, user_email) VALUES (?, ?, ?)';

//     // 執行資料庫查詢
//     pool.query(query, [newUser.user_account, newUser.user_password, newUser.user_email], (err, results) => {
//         if (err) {
//             return callback(err, null);
//         }
//         // 將結果返回給回調函數
//         callback(null, { ...newUser });
//     });
//     // return promisePool.query(query, [newUser.user_account, newUser.user_password, newUser.user_email]);
// }

// 新增------------------------
function create(newUser, callback) {
    const query = 'INSERT INTO useraccount (user_account, user_password, user_email) VALUES (?, ?, ?)';

    // 執行資料庫查詢
    pool.query(query, [newUser.user_account, newUser.user_password, newUser.user_email], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 獲取新插入的useraccount ID
        const newUserId = results.insertId;

        // 插入到另一個資料表，例如 user_data
        const detailQuery = 'INSERT INTO user_data (userId, username, permissions) VALUES (?, ?, ?)';
        pool.query(detailQuery, [newUserId, newUser.user_account, '員工'], (detailErr, detailResults) => {
            if (detailErr) {
                return callback(detailErr, null);
            }

            // 將結果返回給回調函數
            callback(null, { ...newUser, id: newUserId });
        });
    });
}

// 檢查是否有相同帳號
function findByAccount(user_account, callback) {
    const query = 'SELECT * FROM useraccount WHERE user_account = ? LIMIT 1';

    // 執行資料庫查詢
    pool.query(query, [user_account], (err, results) => {
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

// 更新密碼---------------------
function update(id, updateUser, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE useraccount SET user_password = ? WHERE id = ?';
    const values = [updateUser.user_password, id];

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
        pool.query('SELECT * FROM useraccount WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}
// ----------------------------

// 刪除單一---------------------
function deleteOne(id, callback) {
    // 構建 SQL 查詢
    const query = 'DELETE FROM useraccount WHERE id = ?';

    // 執行資料庫查詢
    pool.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 檢查是否有行被刪除
        if (results.affectedRows === 0) {
            return callback(null, null); // 如果沒有行被刪除，返回 null
        }

        // 返回刪除的項目
        callback(null, { id });
    });
}
// ----------------------------

// 刪除多個---------------------
function deleteById(ids, callback) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return callback(new Error('無效的使用者 ID 或是 空的 ID 陣列'), null);
    }

    // 首先根據 user_data 的 id 刪除對應的記錄，並且獲取對應的 userId
    const selectUserDataQuery = 'SELECT userId FROM user_data WHERE id IN (?)';
    pool.query(selectUserDataQuery, [ids], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 如果找不到對應的 user_data 記錄，返回提示
        if (results.length === 0) {
            return callback(null, { message: '沒有符合條件的 user_data 記錄' });
        }

        // 獲取所有的 userId
        const userIds = results.map(row => row.userId);

        // 刪除 user_data 表中的記錄
        const deleteUserDataQuery = 'DELETE FROM user_data WHERE id IN (?)';
        pool.query(deleteUserDataQuery, [ids], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            // 刪除 useraccount 表中對應 userId 的記錄
            const deleteUserAccountQuery = 'DELETE FROM useraccount WHERE id IN (?)';
            pool.query(deleteUserAccountQuery, [userIds], (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                // 返回成功刪除的結果
                callback(null, { deletedCount: results.affectedRows });
            });
        });
    });
}
// ----------------------------

// 驗證使用者登入---------------
function loginUser(userId, callback) {
    const query = 'SELECT * FROM user_data WHERE userid = ?';

    // 執行資料庫查詢
    pool.query(query, [userId], (err, results) => {
        if (err) {
            return callback(err, null); // 如果查詢出錯，返回錯誤
        }
        // 如果找不到記錄，返回 null
        if (results.length === 0) {
            return callback(null, null); // 沒有找到任何結果
        }
        // 將第一筆結果返回給回調函數
        callback(null, results[0]); // 返回查詢到的第一筆資料
    });
}

// 儲存權限
function updatePermissions(userId, updateUser, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE user_data SET permissions = ? WHERE userId = ?';
    const values = [updateUser.permissions, userId];

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
        pool.query('SELECT * FROM user_data WHERE userid = ?', [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}

// 取得單筆資料 並關聯 其資料庫
function getOne(id, callback) {
    const query = `
        SELECT useraccount.*, user_data.* 
        FROM useraccount
        LEFT JOIN user_data ON useraccount.id = user_data.userId
        WHERE user_data.id = ?`;

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

// 更新使用者資料
function updateUserData(id, updateUser) {
    return new Promise((resolve, reject) => {
        // 更新 user_data 表中的 user_avatar 和 username
        let queryUpdateUserData = 'UPDATE user_data SET user_avatar = ?, username = ? WHERE id = ?';
        const valuesUserData = [updateUser.user_avatar, updateUser.username, id];

        pool.query(queryUpdateUserData, valuesUserData, (err, results) => {
            if (err) {
                console.error('更新 user_data 表錯誤: ', err);
                return reject(err); // 觸發拒絕
            }

            if (results.affectedRows === 0) {
                return resolve(null); // 沒有行被更新
            }

            // 查詢 userId
            let queryFindUserId = 'SELECT userId FROM user_data WHERE id = ?';
            pool.query(queryFindUserId, [id], (err, results) => {
                if (err) {
                    console.error('查詢 user_data.userId 錯誤: ', err);
                    return reject(err); // 觸發拒絕
                }

                if (results.length === 0) {
                    return resolve(null); // 沒有找到對應的 user_data.id
                }

                const userId = results[0].userId;

                // 更新 useraccount 表中的 user_email
                let queryUpdateUserAccount = 'UPDATE useraccount SET user_email = ? WHERE id = ?';
                pool.query(queryUpdateUserAccount, [updateUser.user_email, userId], (err, results) => {
                    if (err) {
                        console.error('更新 useraccount 表錯誤: ', err);
                        return reject(err); // 觸發拒絕
                    }

                    // 查詢更新後的資料
                    pool.query(
                        'SELECT * FROM user_data JOIN useraccount ON user_data.userId = useraccount.id WHERE user_data.id = ?',
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
        });
    });
}

module.exports = {
    getAll,
    getOne,
    create,
    findByAccount,
    update,
    deleteOne,
    deleteById,
    loginUser,
    updatePermissions,
    updateUserData
}