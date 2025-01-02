const project_productModel = require('../models/projectModel_products');

// 上傳圖片
const multer = require('multer');
// 處理文件跟目錄路徑
const path = require('path');
const fs = require('fs');

// 設置存儲引擎
const uploadDir = path.join(__dirname, '../img/product');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // 儲存到資料夾
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // 保持原文件名
    }
});
exports.upload = multer({ storage: storage });

// 取得所有---------------------
exports.getAllProducts = (req, res) => {
    project_productModel.getAll((err, products) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        res.send(products)
    })
}
// ----------------------------

// 取得單筆---------------------
exports.getProductById = (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    // 調用 model 的 getOne 函數
    project_productModel.getOne(id, (err, product) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!product) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: '產品 不存在' });
        }

        // 返回找到的使用者
        res.send(product);
    });
};
// ----------------------------

// 更新上下架-------------------
exports.updateProductExhibit = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const { id } = req.params;
        const { exhibit } = req.body;

        if (!id || !exhibit) {
            return res.status(400).json({ error: '缺少必要的參數' }); // 請求錯誤，返回 400
        }

        // 調用 updateExhibit 函數
        project_productModel.updateExhibit(id, { exhibit }, (err, updatedProduct) => {
            if (err) {
                return res.status(500).json({ error: '更新產品上下架時出錯' }); // 伺服器錯誤，返回 500
            }

            if (!updatedProduct) {
                return res.status(404).json({ message: '產品未找到' }); // 資料未找到，返回 404
            }

            // 成功更新，用戶資料
            res.status(200).json(updatedProduct); // 返回更新後的產品資料，狀態碼 200
        });
    } catch (error) {
        // 捕獲並處理任何其他異常錯誤
        console.error('伺服器錯誤: ', error);
        res.status(500).json({ error: '伺服器錯誤' }); // 伺服器錯誤，返回 500
    }
};
// ---------------------------- 

// 新增產品---------------------
exports.createProductData = async (req, res) => {
    const { product_name, product_price, product_img, product_sweetness, product_ice, product_exhibit, product_add, product_classify, product_address } = req.body;

    // 驗證傳入的資料
    if (!product_name || typeof product_name !== 'string') {
        return res.status(400).send({ message: '產品名稱 欄位缺少 或 格式錯誤' });
    }

    if (!product_price || typeof product_price !== 'number') {
        return res.status(400).send({ message: '產品價格 欄位缺少 或 格式錯誤' });
    }

    if (!product_img || typeof product_img !== 'string') {
        return res.status(400).send({ message: '產品圖片 欄位缺少 或 格式錯誤' });
    }

    if (!product_sweetness || typeof product_sweetness !== 'string') {
        return res.status(400).send({ message: '產品甜度 欄位缺少 或 格式錯誤' });
    }

    if (!product_ice || typeof product_ice !== 'string') {
        return res.status(400).send({ message: '產品溫度 欄位缺少 或 格式錯誤' });
    }

    if (!product_exhibit || typeof product_exhibit !== 'string') {
        return res.status(400).send({ message: '產品上/下架 欄位缺少 或 格式錯誤' });
    }

    if (!product_add || typeof product_add !== 'string') {
        return res.status(400).send({ message: '產品加料 欄位缺少 或 格式錯誤' });
    }

    if (!product_classify || typeof product_classify !== 'string') {
        return res.status(400).send({ message: '產品類別 欄位缺少 或 格式錯誤' });
    }

    if (!product_address || typeof product_address !== 'string') {
        return res.status(400).send({ message: '販賣地址 欄位缺少 或 格式錯誤' });
    }

    try {
        // 先檢查資料庫中是否有相同的 product_name
        const existingProduct = await new Promise((resolve, reject) => {
            project_productModel.findByProduct(product_name, (err, product) => {
                if (err) return reject(err);
                resolve(product);
            });
        });

        if (existingProduct) {
            return res.status(400).send({ message: '已有相同產品' });
        }

        // 創建新產品
        const newProduct = { product_name, product_price, product_img, product_sweetness, product_ice, product_exhibit, product_add, product_classify, product_address };
        const createdProduct = await new Promise((resolve, reject) => {
            project_productModel.createProduct(newProduct, (err, product) => {
                if (err) return reject(err);
                resolve(product);
            });
        });

        res.status(201).send(createdProduct);
    } catch (error) {
        console.error('新增產品失敗:', error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
}
// ----------------------------

// 上傳產品圖-------------------
exports.updateProductImg = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: '請上傳產品圖' });
    }
    res.send({ message: '產品圖上傳成功', filename: req.file.originalname });
};
// ----------------------------

// 刪除舊產品圖-----------------
exports.deleteProductImg = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../img/product', filename); // 假設圖檔存放在 ../img/product 目錄中

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("刪除圖檔時發生錯誤:", err);
            return res.status(500).send({ message: '刪除圖檔失敗' });
        }
        res.send({ message: '圖檔刪除成功' });
    });
}
// ----------------------------

// 刪除多個---------------------
exports.deleteMoreProducts = (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ message: 'ID 陣列無效或為空' });
    }

    // 呼叫資料庫模型來刪除多個使用者
    project_productModel.deleteById(ids, (err, result) => {
        if (err) {
            console.error('刪除使用者失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 如果 result 是空的，代表沒有使用者被刪除
        if (!result || result.deletedCount === 0) {
            return res.status(404).send({ message: '沒有找到要刪除的使用者' });
        }

        // 返回成功的刪除結果
        res.send({ message: `${result.deletedCount} 位使用者已被刪除` });
    });
};
// ----------------------------

// 更新產品資料-----------------
exports.updateProductData = async (req, res) => {
    const { id } = req.params;
    const updateProduct = req.body;
    console.log(req.body);

    // 驗證傳入的資料
    if (!updateProduct.product_name || typeof updateProduct.product_name !== 'string') {
        return res.status(400).send({ message: '產品名稱 欄位缺少 或 格式錯誤' });
    }

    if (!updateProduct.product_sweetness || typeof updateProduct.product_sweetness !== 'string') {
        return res.status(400).send({ message: '產品甜度 欄位缺少 或 格式錯誤' });
    }

    if (!updateProduct.product_ice || typeof updateProduct.product_ice !== 'string') {
        return res.status(400).send({ message: '產品溫度 欄位缺少 或 格式錯誤' });
    }

    if (!updateProduct.product_exhibit || typeof updateProduct.product_exhibit !== 'string') {
        return res.status(400).send({ message: '產品上/下架 欄位缺少 或 格式錯誤' });
    }

    if (!updateProduct.product_add || typeof updateProduct.product_add !== 'string') {
        return res.status(400).send({ message: '產品加料 欄位缺少 或 格式錯誤' });
    }

    if (!updateProduct.product_classify || typeof updateProduct.product_classify !== 'string') {
        return res.status(400).send({ message: '產品類別 欄位缺少 或 格式錯誤' });
    }

    if (!updateProduct.product_address || typeof updateProduct.product_address !== 'string') {
        return res.status(400).send({ message: '販賣地址 欄位缺少 或 格式錯誤' });
    }

    try {
        // 呼叫模型中的 updateProductData 函數
        const result = await project_productModel.updateProductData(id, updateProduct);

        if (!result) {
            return res.status(404).send({ message: '找不到使用者資料' });
        }

        res.send({ message: '更新成功', data: result });
    } catch (err) {
        console.error('更新失敗:', err);
        res.status(500).send({ message: '更新失敗', error: err.message });
    }
};
// ----------------------------