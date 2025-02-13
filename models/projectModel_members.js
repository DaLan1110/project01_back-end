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
        console.log('連接成功連接到資料庫 project01_node02 members');
    } catch (err) {
        console.error('資料庫連接失敗:', err.stack);
    }
}

// 執行檢查
checkConnection();
// ----------------------------

// 定義模型
const MemberAccount = sequelize.define(
    'MemberAccount',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        member_account: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        member_password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        member_permissions: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'memberaccount',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

const MemberData = sequelize.define(
    'MemberData',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        member_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        member_email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        member_phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        member_avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'member_data',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

// 定義關聯
MemberAccount.hasOne(MemberData, { foreignKey: 'memberId' }); // 一個 MemberAccount 對應一個 MemberData
MemberData.belongsTo(MemberAccount, { foreignKey: 'memberId' }); // MemberData 屬於某個 MemberAccount

// 取得所有---------------------
async function getAll() {
    try {
        const members = await MemberData.findAll({
            include: [{
                model: MemberAccount,
                required: false, // 使用 LEFT JOIN
            }],
        });

        if (!members || members.length === 0) {
            return []; // 如果沒有找到使用者，返回空陣列
        }

        // 重組資料格式
        const results = members.map((member) => ({
            id: member.id,
            member_name: member.member_name,
            member_email: member.member_email,
            member_phone: member.member_phone,
            memberId: member.memberId,
            member_account: member.MemberAccount?.member_account, // 從關聯表中提取值
            member_permissions: member.MemberAccount?.member_permissions,
            create_at: member.MemberAccount?.create_at,
            update_at: member.MemberAccount?.update_at,
        }));


        return results;
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error;
    }
}
// ----------------------------

// 取得單筆資料 並關聯 其資料庫--
async function getOne(id) {
    try {
        // 查詢單一使用者並關聯 member_data
        const member = await MemberData.findOne({
            where: { memberId: id }, // 根據 ID 查找
            include: [{
                model: MemberAccount, // 關聯 MemberData 表
                required: false, // 使用 LEFT JOIN
            }],
        });

        if (!member) {
            return null; // 如果沒有找到使用者，返回空陣列
        }

        // // 重組資料格式
        const result = {
            id: member.id,
            member_name: member.member_name,
            member_email: member.member_email,
            member_phone: member.member_phone,
            member_avatar: member.member_avatar,
            memberId: member.memberId,
            member_account: member.MemberAccount?.member_account,
        };

        return result; // 返回找到的使用者資料，若無則返回 null
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error; // 拋出錯誤以便外部捕捉
    }
}
// ----------------------------

// 更新權限---------------------
async function updatePermissions(id, permissions) {
    try {
        console.log('更新條件:', id);
        console.log('更新內容:', permissions);

        // 更新 member_data 表的 permissions 欄位
        const [affectedRows] = await MemberAccount.update(
            { member_permissions: permissions }, // 更新的內容
            { where: { id } } // 更新條件
        );

        if (affectedRows === 0) {
            console.error('未找到匹配的 ID, 無法更新');
            return null; // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的用戶資料
        const updatedMember = await MemberAccount.findOne({ where: { id } });
        if (!updatedMember) {
            console.error('更新後未找到 ID 的用戶');
            return null;
        }

        return updatedMember; // 返回更新後的用戶資料
    } catch (err) {
        console.error('更新用戶權限時出錯: ', err);
        throw err; // 拋出錯誤讓 controller 捕獲
    }
}
// ----------------------------

// 新增------------------------
async function createMember(newMember) {
    const transaction = await sequelize.transaction();
    try {
        // 新增到 memberaccount
        const member = await MemberAccount.create(
            {
                member_account: newMember.member_account,
                member_password: newMember.member_password,
                member_permissions: '會員',
            },
            { transaction }
        );

        // 確認 memberaccount 新增成功
        if (!member || !member.id) {
            throw new Error('新增 MemberAccount 失敗');
        }

        // 2. 新增到 member_data
        const memberData = await MemberData.create(
            {
                memberId: member.id, // 使用 memberaccount 生成的 id
                member_name: newMember.member_account,
                member_email: newMember.member_email,
                member_phone: newMember.member_phone,
            },
            { transaction }
        );

        // 確認 member_data 新增成功
        if (!memberData) {
            throw new Error('新增 MemberData 失敗');
        }

        // 提交交易
        await transaction.commit();
        return member;
    } catch (error) {
        // 回滾交易
        await transaction.rollback();
        console.error('新增失敗:', error);
        throw error;
    }
}
// ----------------------------

// 檢查是否有相同帳號-----------
async function findByAccount(member_account) {
    try {
        // 查詢帳號是否存在
        const member = await MemberAccount.findOne({
            where: { member_account: member_account },
        });

        if (member) {
            // 找到相同的帳號，返回用戶資料
            return member;
        } else {
            // 沒有找到相同的帳號
            return null;
        }
    } catch (error) {
        // 若有錯誤，拋出錯誤
        console.error('查詢失敗:', error);
        throw error;
    }
}
// ----------------------------

// 刪除多個---------------------
async function deleteById(ids, callback) {
    try {
        // 1. 查詢 `member_data` 表中對應的記錄，獲取 `memberId`
        const memberDataRecords = await MemberData.findAll({
            where: { id: ids },
            attributes: ['memberId'], // 只選擇 memberId 欄位
        });

        // 如果找不到對應的記錄，返回提示
        if (memberDataRecords.length === 0) {
            return callback(null, { message: '沒有符合條件的 member_data 記錄' });
        }

        // 提取所有的 memberId
        const memberIds = memberDataRecords.map(record => record.memberId);

        // 2. 刪除 `member_data` 表中的記錄
        await MemberData.destroy({
            where: { id: ids },
        });

        // 3. 刪除 `memberaccount` 表中的記錄
        const deletedCount = await MemberAccount.destroy({
            where: { id: memberIds },
        });

        // 返回成功刪除的結果
        return callback(null, { deletedCount });
    } catch (error) {
        return callback(error, null);
    }
}
// ----------------------------

// 更新會員資料-----------------
async function updateMemberData(id, updateMember) {
    try {
        // 更新 `member_data` 表
        const [updatedRows] = await MemberData.update(
            {
                member_name: updateMember.member_name,
                member_email: updateMember.member_email,
                member_phone: updateMember.member_phone,
                member_avatar: updateMember.member_avatar,

            },
            {
                where: { memberId: id },
            }
        );

        if (updatedRows === 0) {
            console.error('未找到匹配的 ID, 無法更新');
            return null; // 沒有行被更新
        }

        // 查詢更新後的資料
        const updatedMemberData = await MemberData.findOne({
            where: { memberId: id },
            include: [
                {
                    model: MemberAccount,
                    as: 'MemberAccount', // 假設你設定了模型關聯
                },
            ],
        });

        return updatedMemberData; // 返回更新後的資料
    } catch (error) {
        console.error('更新資料失敗:', error);
        throw error;
    }
}
// ----------------------------

// 更新會員密碼-----------------
async function updateMemberPwd(id, updateMember) {
    try {
        // 查找指定 ID 的使用者
        const member = await MemberAccount.findByPk(id);
        if (!member) {
            // 如果找不到該使用者，返回 null
            return null;
        }

        // 更新資料（包括密碼，如果有的話）
        await member.update(updateMember);

        // 返回更新後的使用者資料
        return member;
    } catch (error) {
        console.error('更新資料失敗:', error);
        throw error;
    }
}
// ----------------------------

// 驗證會員登入-----------------
async function loginMember(memberId) {
    try {
        // 查詢 member_data 表中的資料
        const member = await MemberData.findOne({
            where: { memberId }, // 使用 where 條件過濾
        });

        // 如果找不到記錄，返回 null
        if (!member) {
            return null; // 無結果返回 null
        }

        // 返回找到的第一筆資料
        return member;
    } catch (err) {
        console.error('查詢失敗:', err);
        throw new Error('伺服器錯誤');
    }
}
// ----------------------------

module.exports = {
    // 資料庫
    MemberAccount, MemberData,
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
    // 驗證會員登入
    loginMember,
}