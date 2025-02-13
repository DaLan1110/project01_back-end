require('dotenv').config();
const cloudinary = require('cloudinary').v2

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 上傳圖片
const multer = require('multer');
// 處理文件跟目錄路徑
const path = require('path');

const uploadMulter = multer({
    limits: {
        fileSize: 83886080, //最大 10mb
    },
    fileFilter: function (req, file, cb) {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            const error = new Error(
                '圖片檔案格式不符，請上傳 jpg / jpeg / png 檔案。'
            );
            error.statusCode = 400;
            error.isOperational = true;
            return cb(error); //回傳錯誤
        }
        cb(null, true); //回傳 pass 
    },
}).single('image'); //只接收 formdata 中名爲 'image' 的欄位

// 刪除圖片 API
const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body; // 從前端取得 public_id

        if (!publicId) {
            return res.status(400).json({ error: "缺少 public_id" });
        }

        // 刪除圖片
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary 刪除結果:", result);

        if (result.result !== "ok") {
            return res.status(400).json({ error: "刪除失敗" });
        }

        res.json({ message: "圖片刪除成功", publicId });
    } catch (error) {
        console.error("刪除圖片錯誤:", error);
        res.status(500).json({ error: "伺服器錯誤" });
    }
};

module.exports = {
    // 上傳照片
    uploadMulter,
    // 刪除照片
    deleteImage,
};