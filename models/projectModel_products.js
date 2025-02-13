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
        console.log('連接成功連接到資料庫 project01_node02 products');
    } catch (err) {
        console.error('資料庫連接失敗:', err.stack);
    }
}

// 執行檢查
checkConnection();
// ----------------------------

// 定義模型
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

// 取得所有---------------------
async function getAll() {
    try {
        const products = await ProductData.findAll();
        return products;
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error;
    }
}
// ----------------------------

// 取得單筆資料-----------------
async function getOne(id) {
    try {
        // 查詢單一使用者並關聯 product_data
        const product = await ProductData.findOne({
            where: { id }, // 根據 ID 查找
        });

        return product; // 返回找到的使用者資料，若無則返回 null
    } catch (error) {
        console.error('查詢失敗:', error);
        throw error; // 拋出錯誤以便外部捕捉
    }
}
// ----------------------------

// 更新上下架-------------------
async function updateExhibit(id, exhibit) {
    try {
        // 更新 product_data 表的 product_exhibit 欄位
        const [affectedRows] = await ProductData.update(
            { product_exhibit: exhibit }, // 更新的內容
            { where: { id } } // 更新條件
        );

        if (affectedRows === 0) {
            console.error('未找到匹配的 ID, 無法更新');
            return null; // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的用戶資料
        const updatedProduct = await ProductData.findOne({ where: { id } });
        if (!updatedProduct) {
            console.error('更新後未找到 ID 的產品');
            return null;
        }

        return updatedProduct; // 返回更新後的用戶資料
    } catch (err) {
        console.error('更新產品上下架時出錯: ', err);
        throw err; // 拋出錯誤讓 controller 捕獲
    }
}
// ----------------------------

// 新增產品---------------------
async function createProduct(newProduct) {
    try {
        // 新增到 product_data
        const product = await ProductData.create(
            {
                product_name: newProduct.product_name,
                product_price: newProduct.product_price,
                product_img: newProduct.product_img,
                product_sweetness: newProduct.product_sweetness,
                product_ice: newProduct.product_ice,
                product_exhibit: newProduct.product_exhibit,
                product_add: newProduct.product_add,
                product_classify: newProduct.product_classify,
                product_address: newProduct.product_address,
            }
        );

        // 確認 product_data 新增成功
        if (!product) {
            throw new Error('新增 ProductData 失敗');
        }

        return product;
    } catch (error) {
        console.error('新增失敗:', error);
        throw error;
    }
}
// ----------------------------

// 檢查是否有相同產品------------
async function findByProduct(product_name) {
    try {
        // 查詢產品是否存在
        const product = await ProductData.findOne({
            where: { product_name: product_name },
        });

        if (product) {
            // 找到相同的產品，返回產品資料
            return product;
        } else {
            // 沒有找到相同的產品
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
async function deleteById(ids) {
    try {
        // 使用 Sequelize 的 destroy 方法刪除資料
        const deletedCount = await ProductData.destroy({
            where: {
                id: ids, // Sequelize 會自動處理陣列轉換
            },
        });

        // 返回刪除的結果
        return deletedCount;
    } catch (err) {
        console.error('刪除失敗:', err);
        throw err; // 拋出錯誤供上層捕捉
    }
}
// ----------------------------

// 更新產品資料-----------------
async function updateProductData(id, updateProduct) {
    try {
        // 更新 `product_data` 表
        const [updatedRows] = await ProductData.update(
            {
                product_name: updateProduct.product_name,
                product_price: updateProduct.product_price,
                product_img: updateProduct.product_img,
                product_sweetness: updateProduct.product_sweetness,
                product_ice: updateProduct.product_ice,
                product_exhibit: updateProduct.product_exhibit,
                product_add: updateProduct.product_add,
                product_classify: updateProduct.product_classify,
                product_address: updateProduct.product_address,
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
        const updatedProductData = await ProductData.findOne({
            where: { id },
        });

        return updatedProductData; // 返回更新後的資料
    } catch (error) {
        console.error('更新資料失敗:', error);
        throw error;
    }
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