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
        console.log('連接成功連接到資料庫 project01_node02 users');
    } catch (err) {
        console.error('資料庫連接失敗:', err.stack);
    }
}

// 執行檢查
checkConnection();
// ----------------------------

// 定義模型
const UserAccount = sequelize.define(
    'UserAccount',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_account: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'useraccount',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

const UserData = sequelize.define(
    'UserData',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        permissions: {
            type: DataTypes.STRING,
            defaultValue: '員工',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'user_data',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

// 定義關聯
UserAccount.hasOne(UserData, { foreignKey: 'userId' });
UserData.belongsTo(UserAccount, { foreignKey: 'userId' });

// 取得所有---------------------
async function getAll() {
    try {
        const users = await UserAccount.findAll({
            include: [{
                model: UserData,
                required: false, // 使用 LEFT JOIN
            }],
        });
        // 將 UserDatum 的屬性展平並合併到外層
        const formattedUsers = users.map(user => {
            const { UserDatum, ...userWithoutUserDatum } = user.toJSON(); // 將 Sequelize 實例轉換為純物件
            return {
                ...userWithoutUserDatum,
                ...(UserDatum || {}) // 如果 UserDatum 存在，將其展平合併
            };
        });

        return formattedUsers; F
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error;
    }
}
// ----------------------------

// 取得單筆資料 並關聯 其資料庫--
async function getOne(id) {
    try {
        // 查詢單一使用者並關聯 user_data
        const user = await UserData.findOne({
            where: { id }, // 根據 ID 查找
            include: [{
                model: UserAccount, // 關聯 UserData 表
                required: false, // 使用 LEFT JOIN
            }],
        });

        if (!user) {
            return null; // 如果沒有找到使用者，返回 null
        }

        // 重組資料格式
        const result = {
            id: user.id,
            username: user.username,
            permissions: user.permissions,
            userId: user.userId,
            user_avatar: user.user_avatar,
            user_account: user.UserAccount?.user_account, // 從關聯表中提取值
            user_email: user.UserAccount?.user_email,
            create_at: user.UserAccount?.create_at,
            update_at: user.UserAccount?.update_at,
        };

        return result; // 返回找到的使用者資料，若無則返回 null
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error; // 拋出錯誤以便外部捕捉
    }
}
// ----------------------------

// 新增------------------------
async function create(newUser) {
    const transaction = await sequelize.transaction();
    try {
        // 新增到 useraccount
        const user = await UserAccount.create(
            {
                user_account: newUser.user_account,
                user_password: newUser.user_password,
                user_email: newUser.user_email,
            },
            { transaction }
        );

        // 確認 useraccount 新增成功
        if (!user || !user.id) {
            throw new Error('新增 useraccount 失敗');
        }

        // 2. 新增到 user_data
        const users = await UserData.create(
            {
                userId: user.id, // 使用 useraccount 生成的 id
                username: newUser.user_account,
                permissions: '員工',
            },
            { transaction }
        );

        // 確認 user_data 新增成功
        if (!users) {
            throw new Error('新增 user_data 失敗');
        }

        // 提交交易
        await transaction.commit();
        return user;
    } catch (error) {
        // 回滾交易
        await transaction.rollback();
        console.error('新增失敗:', error);
        throw error;
    }
}
// ----------------------------

// 檢查是否有相同帳號-----------
async function findByAccount(user_account) {
    try {
        // 查詢帳號是否存在
        const user = await UserAccount.findOne({
            where: { user_account: user_account },
        });

        if (user) {
            // 找到相同的帳號，返回用戶資料
            return user;
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

// 更新密碼---------------------
async function updatePwd(id, updateUser) {
    try {
        // 查找指定 ID 的使用者
        const user = await UserAccount.findByPk(id);
        if (!user) {
            // 如果找不到該使用者，返回 null
            return null;
        }

        // 更新資料（包括密碼，如果有的話）
        await user.update(updateUser);

        // 返回更新後的使用者資料
        return user;
    } catch (error) {
        console.error('更新資料失敗:', error);
        throw error;
    }
}
// ----------------------------

// 更新使用者資料---------------
async function updateUserData(id, updateUser) {
    try {
        // 更新 `user_data` 表中的 `user_avatar` 和 `username`
        const [updatedRows] = await UserData.update(
            {
                user_avatar: updateUser.user_avatar,
                username: updateUser.username,
            },
            {
                where: { id },
            }
        );

        if (updatedRows === 0) {
            return null; // 沒有行被更新
        }

        // 查詢對應的 `userId`
        const userData = await UserData.findOne({ where: { id } });
        if (!userData) {
            return null; // 沒有找到對應的 `user_data`
        }

        const userId = userData.userId;

        // 更新 `useraccount` 表中的 `user_email`
        await UserAccount.update(
            {
                user_email: updateUser.user_email,
            },
            {
                where: { id: userId },
            }
        );

        // 查詢更新後的資料
        const updatedUserData = await UserData.findOne({
            where: { id },
            include: [
                {
                    model: UserAccount,
                    as: 'UserAccount', // 假設你設定了模型關聯
                },
            ],
        });

        return updatedUserData; // 返回更新後的資料
    } catch (error) {
        console.error('更新資料失敗:', error);
        throw error;
    }
}
// ----------------------------

// 更新權限---------------------
async function updatePermissions(userId, permissions) {
    try {
        // 更新 user_data 表的 permissions 欄位
        const [affectedRows] = await UserData.update(
            { permissions }, // 更新的內容
            { where: { userId } } // 更新條件
        );

        if (affectedRows === 0) {
            console.error('未找到匹配的 userId，無法更新');
            return null; // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的用戶資料
        const updatedUser = await UserData.findOne({ where: { userId } });
        if (!updatedUser) {
            console.error('更新後未找到 userId 的用戶');
            return null;
        }

        return updatedUser; // 返回更新後的用戶資料
    } catch (err) {
        console.error('更新用戶權限時出錯: ', err);
        throw err; // 拋出錯誤讓 controller 捕獲
    }
}
// ----------------------------

// 刪除單一---------------------
async function deleteOne(id) {
    try {
        // 使用 Sequelize 的 `destroy` 方法刪除記錄
        const deletedRows = await UserAccount.destroy({
            where: { id }, // 刪除條件
        });

        // 如果沒有行被刪除，返回 null
        if (deletedRows === 0) {
            return null;
        }

        // 返回刪除的 ID
        return { id };
    } catch (err) {
        console.error('刪除使用者失敗:', err);
        throw err; // 將錯誤拋出供 Controller 捕獲
    }
}
// ----------------------------

// 刪除多個---------------------
async function deleteById(ids) {
    try {
        // 查詢 UserData 表，獲取指定 ids 對應的 userId 列表
        const userDataRecords = await UserData.findAll({
            attributes: ['userId'], // 只提取 userId 欄位
            where: { id: { [Op.in]: ids } },
        });

        // 提取 userId 作為純陣列
        const userIds = userDataRecords.map((record) => record.userId);

        if (userIds.length === 0) {
            return { message: '沒有找到符合條件的 UserData 記錄' };
        }

        // 刪除 UserData 表中指定的 ids 的記錄
        const deletedUserDataCount = await UserData.destroy({
            where: { id: { [Op.in]: ids } },
        });

        // 刪除 UserAccount 表中與 userId 關聯的記錄
        const deletedUserAccountCount = await UserAccount.destroy({
            where: { id: { [Op.in]: userIds } },
        });

        if (deletedUserAccountCount === 0) {
            return { message: '沒有符合條件的 UserAccount 記錄' };
        }

        // 返回刪除的記錄數
        return {
            deletedUserDataCount,
            deletedUserAccountCount,
        };
    } catch (err) {
        console.error('刪除失敗:', err);
        throw err;
    }
}
// ----------------------------

// 驗證使用者登入---------------
async function loginUser(userId) {
    try {
        // 查詢 user_data 表中的資料
        const user = await UserData.findOne({
            where: { userId }, // 使用 where 條件過濾
        });

        // 如果找不到記錄，返回 null
        if (!user) {
            return null; // 無結果返回 null
        }

        // 返回找到的第一筆資料
        return user;
    } catch (err) {
        console.error('查詢失敗:', err);
        throw new Error('伺服器錯誤');
    }
}
// ----------------------------



module.exports = {
    // 資料庫
    UserAccount, UserData,
    // 取得所有
    getAll,
    // 取得單一
    getOne,
    // 新增
    create,
    // 檢查是否有相同帳號
    findByAccount,
    // 更新密碼
    updatePwd,
    // 更新使用者資料
    updateUserData,
    // 更新權限
    updatePermissions,
    // 刪除單一
    deleteOne,
    // 刪除多個
    deleteById,
    // 驗證使用者登入
    loginUser,
}