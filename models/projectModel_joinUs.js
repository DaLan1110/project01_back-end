const { Sequelize, DataTypes, Op } = require('sequelize');
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

// 定義模型
const JoinUsData = sequelize.define(
    'JoinUsData',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        join_us_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        join_us_phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        join_us_email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        join_us_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        join_us_permissions: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'join_us_data',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

// 取得所有---------------------
async function getAll() {
    try {
        const joins = await JoinUsData.findAll();
        return joins;
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error;
    }
}
// ----------------------------

// 取得單筆資料-----------------
async function getOne(id) {
    try {
        // 查詢單一使用者並關聯 join_us_data
        const join = await JoinUsData.findOne({
            where: { id }, // 根據 ID 查找
        });

        return join; // 返回找到的使用者資料，若無則返回 null
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error; // 拋出錯誤以便外部捕捉
    }
}
// ----------------------------

// 新增地址---------------------
async function createJoinUs(newJoinUs) {
    try {
        // 新增到 join_us_data
        const join = await JoinUsData.create(
            {
                join_us_name: newJoinUs.join_us_name,
                join_us_phone: newJoinUs.join_us_phone,
                join_us_email: newJoinUs.join_us_email,
                join_us_address: newJoinUs.join_us_address,
                join_us_permissions: 'false',
            }
        );

        // 確認 join_us_data 新增成功
        if (!join) {
            throw new Error('新增 JoinUsData 失敗');
        }

        return join;
    } catch (error) {
        console.error('新增失敗:', error);
        throw error;
    }
}
// ----------------------------

// 檢查是否有相同地址 -----------
async function findByAddress(address) {
    try {
        // 使用 Sequelize 的 findOne 方法查詢第一筆符合條件的記錄
        const result = await JoinUsData.findOne({
            where: { join_us_address: address }, // 查詢條件
        });

        // 如果找到資料，返回該記錄，否則返回 null
        return result;
    } catch (err) {
        console.error('查詢地址失敗:', err);
        throw err; // 抛出錯誤供上層捕獲
    }
}
// ----------------------------

// 檢查是否有相同地址排除自己 ---
async function findByAddressToId(address, id) {
    try {
        // 使用 Sequelize 的 findOne 方法查詢符合條件的第一筆記錄
        const result = await JoinUsData.findOne({
            where: {
                join_us_address: address, // 查詢條件1：地址相同
                id: { [Sequelize.Op.ne]: id }, // 查詢條件2：ID 不等於指定的 id
            },
        });

        // 返回查詢結果，找不到時為 null
        return result;
    } catch (err) {
        console.error('查詢地址失敗:', err);
        throw err; // 抛出錯誤供上層捕獲
    }
}
// ----------------------------

// 刪除多個---------------------
async function deleteMoreById(ids) {
    try {
        // 使用 Sequelize 的 destroy 方法刪除資料
        const deleteJoinUsDataQuery = await JoinUsData.destroy({
            where: {
                id: ids, // Sequelize 會自動處理陣列轉換
            },
        });

        // 返回刪除的結果
        return deleteJoinUsDataQuery;
    } catch (err) {
        console.error('刪除失敗:', err);
        throw err; // 拋出錯誤供上層捕捉
    }
}
// ----------------------------

// 刪除單一 --------------------
async function deleteById(id) {
    try {
        // 嘗試刪除記錄
        const deletedCount = await JoinUsData.destroy({
            where: {
                id: id, // 查詢條件：ID 必須匹配
            },
        });

        // 檢查是否刪除了任何記錄
        // if (deletedCount === 0) {
        //     throw new Error('找不到該 ID 對應的加入者');
        // }

        // 返回成功刪除的結果
        return deletedCount;
    } catch (err) {
        console.error('刪除加入者失敗:', err);
        throw err;
    }
}
// ----------------------------

// 更新加入者資料---------------
async function updateJoinUsData(id, updateJoinUs) {
    try {
        // 更新 `product_data` 表
        const [updatedRows] = await JoinUsData.update(
            {
                join_us_name: updateJoinUs.join_us_name,
                join_us_phone: updateJoinUs.join_us_phone,
                join_us_email: updateJoinUs.join_us_email,
                join_us_address: updateJoinUs.join_us_address,
            },
            {
                where: { id },
            }
        );

        if (updatedRows === 0) {
            console.error('未找到匹配的 ID, 無法更新');
            return null; // 沒有行被更新
        }

        // 查詢更新後的資料
        const updatedJoinUsData = await JoinUsData.findOne({
            where: { id },
        });

        return updatedJoinUsData; // 返回更新後的資料
    } catch (error) {
        console.error('更新資料失敗:', error);
        throw error;
    }
}
// ----------------------------

// 更新權限---------------------
async function updatePermissions(id) {
    try {
        // 更新 join_us_data 表的 join_us_permissions 欄位
        const [affectedRows] = await JoinUsData.update(
            { join_us_permissions: 'true' }, // 更新的內容
            { where: { id } } // 更新條件
        );

        if (affectedRows === 0) {
            console.error('未找到匹配的 ID, 無法更新');
            return null; // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的用戶資料
        const updatedJoinUs = await JoinUsData.findOne({ where: { id } });
        if (!updatedJoinUs) {
            console.error('更新後未找到 ID 的加入者');
            return null;
        }

        return updatedJoinUs; // 返回更新後的加入者資料
    } catch (err) {
        console.error('更新加入者權限時出錯: ', err);
        throw err; // 拋出錯誤讓 controller 捕獲
    }
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