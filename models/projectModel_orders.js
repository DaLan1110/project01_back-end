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
        console.log('連接成功連接到資料庫 project01_node02 orders');
    } catch (err) {
        console.error('資料庫連接失敗:', err.stack);
    }
}

// 執行檢查
checkConnection();
// ----------------------------

// 定義模型
const OrderData = sequelize.define(
    'OrderData',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order_state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order_total: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order_pay: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'order_data',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

const ShoppingList = sequelize.define(
    'ShoppingList',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        shop_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_quantity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_total: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_img: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_sweetness: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_ice: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_add: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'shopping_list',
        timestamps: true,          // 啟用時間戳
        createdAt: 'created_at',    // 自定義 createdAt 欄位名稱
        updatedAt: false,
    }
);

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

const ProductData = sequelize.define(
    'ProductData',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_img: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_sweetness: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_ice: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_exhibit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_add: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_classify: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'product_data',
        timestamps: true,          // 啟用時間戳
        createdAt: 'create_at',    // 自定義 createdAt 欄位名稱
        updatedAt: 'update_at',    // 自定義 updatedAt 欄位名稱
    }
);

// 定義關聯
// MemberData 與 MemberAccount 的關聯
MemberData.belongsTo(MemberAccount, {
    foreignKey: 'memberId', // member_data 表中的外鍵
    targetKey: 'id', // memberaccount 表中的主鍵
});
MemberAccount.hasOne(MemberData, {
    foreignKey: 'memberId',
    sourceKey: 'id',
});

// OrderData 與 MemberData 的關聯
OrderData.belongsTo(MemberData, {
    foreignKey: 'memberId', // order_data 表中的外鍵
    targetKey: 'id', // member_data 表中的主鍵
});
MemberData.hasMany(OrderData, {
    foreignKey: 'memberId',
    sourceKey: 'id',
});

// ShoppingList 與 MemberData 的關聯
ShoppingList.belongsTo(MemberData, {
    foreignKey: 'memberId', // shopping_list 表中的外鍵
    targetKey: 'memberId', // member_data 表中的 memberId
});
MemberData.hasMany(ShoppingList, {
    foreignKey: 'memberId',
    sourceKey: 'memberId',
});

// ShoppingList 與 OrderData 的關聯
ShoppingList.belongsTo(OrderData, {
    foreignKey: 'orderId', // shopping_list 表中的外鍵
    targetKey: 'id', // order_data 表中的主鍵
});
OrderData.hasMany(ShoppingList, {
    foreignKey: 'orderId',
    sourceKey: 'id',
});

// ShoppingList 與 ProductData 的關聯
ShoppingList.belongsTo(ProductData, {
    foreignKey: 'productId', // shopping_list 表中的外鍵
    targetKey: 'id', // product_data 表中的主鍵
    // as: 'product',
});
ProductData.hasMany(ShoppingList, {
    foreignKey: 'productId',
    sourceKey: 'id',
    // as: 'shoppingLists',
});

// 取得所有---------------------
async function getAll() {
    try {
        const orders = await OrderData.findAll({
            include: [
                {
                    model: MemberData,
                    required: false, // 使用 LEFT JOIN
                    attributes: ['member_name'], // 僅選取需要的欄位
                    include: [
                        {
                            model: MemberAccount,
                            required: false, // 使用 LEFT JOIN
                            attributes: ['member_account'], // 僅選取需要的欄位
                        },
                    ],
                },
            ],
            // attributes: { exclude: ['memberId'] }, // 排除不需要的欄位
        });

        // 假設 orders 為陣列，對每筆訂單進行「攤平」
        const flattenedOrders = orders.map(order => ({
            create_at: order.create_at,
            id: order.id,
            isChecked: order.isChecked,
            memberId: order.memberId,
            order_number: order.order_number,
            order_pay: order.order_pay,
            order_state: order.order_state,
            order_total: order.order_total,
            update_at: order.update_at,
            // 取得會員名稱與帳號，注意關聯名稱請依照模型設定 (例如：MemberData)
            member_name: order.MemberDatum?.member_name || null,
            member_account: order.MemberDatum?.MemberAccount?.member_account || null,
        }));

        return flattenedOrders;
    } catch (err) {
        throw err; // 丟出錯誤給調用方
    }
}
// ----------------------------

// 取得單筆資料-----------------
async function getOne(id) {
    try {
        // 查詢 OrderData 並包含相關聯的資料
        const orderData = await OrderData.findOne({
            where: { id }, // 查詢條件
            include: [
                {
                    model: MemberData,
                    attributes: ['member_name'], // 僅選取需要的欄位
                    include: [
                        {
                            model: MemberAccount,
                            attributes: ['member_account'], // 僅選取需要的欄位
                        },
                    ],
                },
                {
                    model: ShoppingList,
                    include: [
                        {
                            model: ProductData, // 如果需要商品資料
                            // as: 'product',
                            attributes: ['product_name', 'product_price'], // 假設這些欄位存在
                        },
                    ],
                },
            ],
        });

        // 重組資料格式，確保 `shoppingList` 和 `member_account` 正確
        return {
            id: orderData.id,
            memberId: orderData.memberId,
            member_name: orderData.MemberDatum?.member_name || null, // 取出會員名稱
            member_account: orderData.MemberDatum?.MemberAccount?.member_account || null, // 取出帳號
            order_number: orderData.order_number,
            order_pay: orderData.order_pay,
            order_state: orderData.order_state,
            order_total: orderData.order_total,
            create_at: orderData.create_at,
            update_at: orderData.update_at,
            shoppingList: orderData.ShoppingLists.map(item => ({
                id: item.id,
                orderId: item.orderId,
                memberId: item.memberId,
                productId: item.productId,
                shop_name: item.shop_name,
                shop_price: item.shop_price,
                shop_quantity: item.shop_quantity,
                shop_total: item.shop_total,
                shop_add: item.shop_add,
                shop_ice: item.shop_ice,
                shop_sweetness: item.shop_sweetness,
                shop_img: item.shop_img,
                created_at: item.created_at,
            })),
        };
    } catch (err) {
        // 如果出錯，丟出錯誤給調用方處理
        throw err;
    }
}
// ----------------------------

// 取得會員的所有筆訂單----------
async function getOrderByMemberId(memberId) {
    try {
        // 查詢單一使用者並關聯 order_data
        const orders = await OrderData.findAll({
            where: { memberId }, // 根據 ID 查找
        });

        return orders; // 返回找到的使用者資料，若無則返回 null
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error; // 拋出錯誤以便外部捕捉
    }
}
// ----------------------------

// 更新訂單狀態-----------------
async function updateOrderState(id, orderState) {
    try {
        // 更新 product_data 表的 order_state 欄位
        const [affectedRows] = await OrderData.update(
            { order_state: orderState }, // 更新的內容
            { where: { id } } // 更新條件
        );

        if (affectedRows === 0) {
            console.error('未找到匹配的 ID, 無法更新');
            return null; // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的用戶資料
        const updatedOrder = await OrderData.findOne({ where: { id } });
        if (!updatedOrder) {
            console.error('更新後未找到 ID 的訂單狀態');
            return null;
        }

        return updatedOrder; // 返回更新後的用戶資料
    } catch (err) {
        console.error('更新訂單狀態時出錯: ', err);
        throw err; // 拋出錯誤讓 controller 捕獲
    }
}
// ----------------------------

// 刪除多個---------------------
async function deleteById(ids, callback) {
    const transaction = await sequelize.transaction(); // 開啟 transaction

    try {
        // 刪除 ShoppingList（先刪關聯資料）
        await ShoppingList.destroy({
            where: { orderId: Array.isArray(ids) ? ids : [ids] },
            transaction,
        });

        // 刪除 OrderData（再刪主要資料）
        const deletedRows = await OrderData.destroy({
            where: { id: Array.isArray(ids) ? ids : [ids] },
            transaction,
        });

        // 提交交易（確保兩者都成功）
        await transaction.commit();

        return callback(null, { deletedRows });
    } catch (err) {
        // 發生錯誤則回滾
        await transaction.rollback();
        return callback(err, null);
    }
}
// ----------------------------

// 產品加入購物車---------------
async function insertShoppingCart(memberId, shoppingCart) {
    try {
        // 新增到 shopping_list
        const shoppingList = await ShoppingList.create(
            {
                memberId: memberId,
                productId: shoppingCart.productId,
                shop_name: shoppingCart.shop_name,
                shop_quantity: shoppingCart.shop_quantity,
                shop_total: shoppingCart.shop_total,
                shop_price: shoppingCart.shop_price,
                shop_img: shoppingCart.shop_img,
                shop_sweetness: shoppingCart.shop_sweetness,
                shop_ice: shoppingCart.shop_ice,
                shop_add: shoppingCart.shop_add,
            }
        );

        // 確認 shopping_list 新增成功
        if (!shoppingList) {
            throw new Error('新增 ShoppingList 失敗');
        }

        return shoppingList;
    } catch (error) {
        console.error('新增失敗:', error);
        throw error;
    }
}
// ----------------------------

// 查看購物車清單---------------
async function getShoppingList(memberId) {
    try {
        // 查詢符合條件的購物清單
        const shoppingList = await ShoppingList.findAll({
            where: {
                memberId, // 假設 ShoppingList 表中有 memberId 欄位
                orderId: null, // 過濾 orderId 為 NULL 的項目
            },
            order: [['created_at', 'ASC']],
        });

        return shoppingList; // 返回結果 (陣列)
    } catch (err) {
        // 拋出錯誤以便外部捕捉
        throw err;
    }
}
// ----------------------------

// 更新減少增加產品數量----------
async function updateShoppingListQuantity(id, updateQuantity) {
    try {
        // 更新 `shop_quantity`
        const [affectedRows] = await ShoppingList.update(
            {
                shop_quantity: updateQuantity.shop_quantity,
                shop_price: updateQuantity.shop_price,
                shop_total: Sequelize.literal(
                    "CAST((CAST(shop_quantity AS NUMERIC) * CAST(shop_price AS NUMERIC)) AS TEXT)"
                ),
            },
            { where: { id } }
        );

        // 如果沒有行被更新，返回 null
        // if (affectedRows === 0) {
        //     return null;
        // }
        if (!affectedRows) {
            return null;
        }

        // 獲取更新後的資料
        const updatedShoppingList = await ShoppingList.findOne({ where: { id } });
        return updatedShoppingList;
    } catch (err) {
        // 拋出錯誤以便外部處理
        throw err;
    }
}
// ----------------------------

// 刪除購物車產品---------------
async function deleteShoppingProductById(id) {
    try {
        // 刪除 shopping_list 表中的記錄
        const deletedCount = await ShoppingList.destroy({
            where: { id },
        });

        // 檢查是否有刪除任何記錄
        if (deletedCount === 0) {
            throw new Error('找不到該 ID 對應的產品');
        }

        // 返回成功刪除的結果
        return { deletedCount };
    } catch (err) {
        // 拋出錯誤以便外部處理
        throw err;
    }
}
// ----------------------------

// 新增下訂單-------------------
async function insertOrder(memberId, order) {
    const transaction = await sequelize.transaction(); // 開啟交易
    try {
        // 1. 新增訂單資料到 order_data 表
        const newOrder = await OrderData.create(
            {
                memberId,
                order_number: order.order_number,
                order_state: '待核款',
                order_total: order.order_total,
                order_pay: order.order_pay,
            },
            { transaction }
        );

        // 2. 更新 shopping_list 表，將符合條件的記錄的 orderId 更新為新插入的訂單 ID
        const updatedRows = await ShoppingList.update(
            { orderId: newOrder.id },
            {
                where: {
                    memberId,
                    orderId: null, // 條件：memberId 相符且 orderId 為 NULL
                },
                transaction,
            }
        );

        // 3. 提交交易
        await transaction.commit();

        // 返回結果
        return { message: '下訂單成功', updatedRows: updatedRows[0] };
    } catch (err) {
        // 回滾交易
        await transaction.rollback();
        console.error('新增訂單失敗:', err); // 記錄錯誤
        throw err; // 向上拋出錯誤
    }
}
// ----------------------------

// 取得前 6 筆資料--------------
async function getOrderToSix() {
    try {
        // 查詢第一組：`order_state = '待核款'`，排序並限制 6 筆
        const pendingOrders = await OrderData.findAll({
            where: { order_state: '待核款' },
            order: [['create_at', 'ASC']],
            limit: 6,
        });

        // 查詢第二組：`order_state = '未付款'`，排序並限制 6 筆
        const unpaidOrders = await OrderData.findAll({
            where: { order_state: '已收款' },
            order: [['create_at', 'ASC']],
            limit: 6,
        });

        // 合併兩組資料
        const combinedOrders = [...pendingOrders, ...unpaidOrders];

        // 按照 `create_at` 排序並限制返回 6 筆資料
        combinedOrders.sort((a, b) => new Date(a.create_at) - new Date(b.create_at));
        return combinedOrders.slice(0, 6);
    } catch (err) {
        console.error('查詢訂單失敗:', err);
        throw err;
    }
}
// ----------------------------

// 取得前 5 筆熱門商品----------
async function getHotProduct() {
    try {
        const hotProducts = await ShoppingList.findAll({
            attributes: [
                'productId',
                'shop_name',
                // [Sequelize.fn('COUNT', Sequelize.col('productId')), 'count'], // 計算商品出現次數
                [Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('shop_quantity'), 'INTEGER')), 'count'] // 轉換為數字後加總

            ],
            where: {
                orderId: {
                    [Op.not]: null, // 排除 orderId 為 null 的條目
                }
            },
            group: ['productId', 'shop_name'],
            order: [[Sequelize.literal('count'), 'DESC']],
            limit: 5,
        });

        return hotProducts; // 返回熱門商品列表
    } catch (err) {
        console.error('查詢熱門商品失敗:', err);
        throw err;
    }
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