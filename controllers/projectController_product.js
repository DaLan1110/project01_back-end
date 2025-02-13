const project_productModel = require('../models/projectModel_products');

// 上傳圖片
const multer = require('multer');
// 處理文件跟目錄路徑
const path = require('path');
const fs = require('fs');

// 設置存儲引擎
const uploadDir = path.join(__dirname, '../img/product');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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
exports.getAllProducts = async (req, res) => {
    try {
        const products = await project_productModel.getAll(); // 這裡直接使用 async/await
        res.send(products);
    } catch (err) {
        console.log('錯誤', err);
        res.status(500).send({
            message: '伺服器錯誤'
        });
    }
};
// ----------------------------

// 取得單筆---------------------
exports.getProductById = async (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    try {
        // 使用 getOne 函式來查詢資料
        const product = await project_productModel.getOne(id);

        if (!product) {
            // 如果找不到該使用者，返回 404 未找到
            return res.status(404).send({ message: 'Product 不存在' });
        }

        // 返回找到的使用者
        res.send(product);
    } catch (err) {
        // 如果查詢發生錯誤，返回 500 伺服器錯誤
        console.error('查詢失敗:', err);
        res.status(500).send({ message: '伺服器錯誤' });
    }
};
// ----------------------------

// 更新上下架-------------------
exports.updateProductExhibit = async (req, res) => {
    try {
        // 從請求的主體中提取 id 和更新的資料
        const id = parseInt(req.params.id, 10);
        const { exhibit } = req.body;

        // 驗證請求的參數
        if (isNaN(id) || !exhibit || typeof exhibit !== 'string') {
            return res.status(400).json({ error: '參數格式無效' });
        }

        // 調用模型中的 updatePermissions 方法
        const updatedProduct = await project_productModel.updateExhibit(id, exhibit);

        if (!updatedProduct) {
            return res.status(404).json({ message: '產品未找到' }); // 用戶未找到，返回 404
        }

        // 成功更新，返回用戶資料
        res.status(200).json({
            message: '產品上下架更新成功',
            data: updatedProduct,
        });
    } catch (err) {
        console.error('伺服器錯誤: ', err);
        res.status(500).json({ error: '伺服器錯誤', message: err.message });
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
        // 先檢查資料庫中是否有相同的 product_data
        const existingProduct = await project_productModel.findByProduct(product_name);

        if (existingProduct) {
            return res.status(400).send({ message: '已有相同產品' });
        }

        // 創建新產品
        const newProduct = { product_name, product_price, product_img, product_sweetness, product_ice, product_exhibit, product_add, product_classify, product_address };
        const createdProduct = await project_productModel.createProduct(newProduct);

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
exports.deleteMoreProducts = async (req, res) => {
    // 從請求的 body 中獲取要刪除的 ID 陣列
    const ids = req.body.ids;

    // 驗證傳入的資料
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'ID 陣列無效或為空' });
    }

    try {
        // 呼叫 Sequelize 的模型來刪除多筆記錄
        const deletedCount = await project_productModel.deleteById(ids);

        // 檢查是否刪除了記錄
        if (deletedCount === 0) {
            return res.status(404).json({ message: '沒有找到要刪除的產品' });
        }

        // 返回成功的刪除結果
        res.status(200).json({ message: `已成功刪除 ${deletedCount} 個產品` });
    } catch (error) {
        console.error('刪除加入者失敗:', error); // 記錄伺服器錯誤
        res.status(500).json({ message: '伺服器錯誤' }); // 返回伺服器錯誤
    }
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
        // 先檢查資料庫中是否有相同的 product_data
        // const product_name = updateProduct.product_name;
        // const existingProduct = await project_productModel.findByProduct(product_name);

        // if (existingProduct) {
        //     return res.status(400).send({ message: '已有相同產品' });
        // }

        // 呼叫模型中的 updateProductData 函數
        const result = await project_productModel.updateProductData(id, updateProduct);

        if (!result) {
            return res.status(404).send({ message: '找不到產品資料' });
        }

        res.send({ message: '更新成功', data: result });
    } catch (err) {
        console.error('更新失敗:', err);
        res.status(500).send({ message: '更新失敗', message: err.message });
    }
};
// ----------------------------