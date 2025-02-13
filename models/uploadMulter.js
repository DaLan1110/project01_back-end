// 上傳圖片
const multer = require('multer');
// 處理文件跟目錄路徑
const path = require('path');

const uploadMulter = multer({
    limits: {
        fileSize: 83886080, //最大 10mb
    },
    fileFilter: function (req, file, cb) {
        let ext = path.extname(file.originalname);
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

module.exports = uploadMulter;