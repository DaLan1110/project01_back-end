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
//         console.log('連接成功連接到資料庫 project01_node02 members');
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
        console.log('連接成功連接到資料庫 project01_node02 members');
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
        SELECT memberaccount.*, member_data.* 
        FROM memberaccount
        LEFT JOIN member_data ON memberaccount.id = member_data.memberId
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

// 取得單筆資料 並關聯 其資料庫--
function getOne(id, callback) {
    const query = `
        SELECT memberaccount.*, member_data.* 
        FROM memberaccount
        LEFT JOIN member_data ON memberaccount.id = member_data.memberId
        WHERE member_data.memberId = ?`;

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

// 更新權限---------------------
function updatePermissions(id, updateMember, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE memberaccount SET member_permissions = ? WHERE id = ?';
    const values = [updateMember.permissions, id];

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
        pool.query('SELECT * FROM memberaccount WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}
// ----------------------------

// 新增會員---------------------
function createMember(newMember, callback) {
    const query = 'INSERT INTO memberaccount (member_account, member_password, member_permissions) VALUES (?, ?, \'會員\')';

    // 執行資料庫查詢
    pool.query(query, [newMember.member_account, newMember.member_password], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 獲取新插入的 ID
        const newMemberId = results.insertId;

        // 插入到另一個資料表，例如 user_data
        const detailQuery = 'INSERT INTO member_data (memberId, member_name, member_email, member_phone) VALUES (?, ?, ?, ?)';
        pool.query(detailQuery, [newMemberId, newMember.member_account, newMember.member_email, newMember.member_phone], (detailErr, detailResults) => {
            if (detailErr) {
                return callback(detailErr, null);
            }

            // 將結果返回給回調函數
            callback(null, { ...newMember, id: newMemberId });
        });
    });
}
// ----------------------------

// 檢查是否有相同帳號
function findByAccount(member_account, callback) {
    const query = 'SELECT * FROM memberaccount WHERE member_account = ? LIMIT 1';

    // 執行資料庫查詢
    pool.query(query, [member_account], (err, results) => {
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

// 刪除多個---------------------
function deleteById(ids, callback) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return callback(new Error('無效的使用者 ID 或是 空的 ID 陣列'), null);
    }

    // 首先根據 member_data 的 id 刪除對應的記錄，並且獲取對應的 memberId
    const selectMemberDataQuery = 'SELECT memberId FROM member_data WHERE id IN (?)';
    pool.query(selectMemberDataQuery, [ids], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 如果找不到對應的 member_data 記錄，返回提示
        if (results.length === 0) {
            return callback(null, { message: '沒有符合條件的 member_data 記錄' });
        }

        // 獲取所有的 memberIds
        const memberIds = results.map(row => row.memberId);

        // 刪除 member_data 表中的記錄
        const deleteMemberDataQuery = 'DELETE FROM member_data WHERE id IN (?)';
        pool.query(deleteMemberDataQuery, [ids], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            // 刪除 memberaccount 表中對應 memberId 的記錄
            const deleteMemberAccountQuery = 'DELETE FROM memberaccount WHERE id IN (?)';
            pool.query(deleteMemberAccountQuery, [memberIds], (err, results) => {
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

// 更新會員資料-----------------
function updateMemberData(id, updateMember) {
    return new Promise((resolve, reject) => {
        // 更新 user_data 表中的 user_avatar 和 username
        let queryUpdateMemberData = 'UPDATE member_data SET member_name = ?, member_email = ?, member_phone = ?, member_avatar = ? WHERE memberId = ?';
        const valuesMemberData = [updateMember.member_name, updateMember.member_email, updateMember.member_phone, updateMember.member_avatar, id];

        pool.query(queryUpdateMemberData, valuesMemberData, (err, results) => {
            if (err) {
                console.error('更新 member_data 表錯誤: ', err);
                return reject(err); // 觸發拒絕
            }

            if (results.affectedRows === 0) {
                return resolve(null); // 沒有行被更新
            }

            // 查詢更新後的資料
            pool.query(
                'SELECT * FROM member_data JOIN memberaccount ON member_data.memberId = memberaccount.id WHERE member_data.memberId = ?',
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

// 更新會員密碼-----------------
function updateMemberPwd(id, updateMember, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE memberaccount SET member_password = ? WHERE id = ?';
    const values = [updateMember.member_password, id];

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
        pool.query('SELECT * FROM memberaccount WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}
// ----------------------------

// 驗證使用者登入---------------
function loginMember(memberId, callback) {
    const query = 'SELECT * FROM member_data WHERE memberId = ?';

    // 執行資料庫查詢
    pool.query(query, [memberId], (err, results) => {
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
// ----------------------------


module.exports = {
    // 取得所有
    getAll,
    // 取得單筆
    getOne,
    // 更新權限
    updatePermissions,
    // 新增帳號
    createMember, findByAccount,
    // 刪除多個會員
    deleteById,
    // 更新會員資料
    updateMemberData,
    // 更新會員密碼
    updateMemberPwd,
    // 登入會員
    loginMember,
}