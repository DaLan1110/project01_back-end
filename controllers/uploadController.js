require('dotenv').config();
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 上傳 Buffer 格式的圖片到 Cloudinary
const uploadFromBuffer = (req) => {
    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
            (error, result) => {
                if (result) {
                    resolve(result);
                    console.log(result)
                } else {
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
    });
};

// 處理圖片上傳的 Controller
exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'Error',
                message: '請上傳檔案'
            });
        }

        const image = await uploadFromBuffer(req);

        res.status(200).json({
            status: 'Success',
            message: '圖片上傳成功',
            data: {
                imageUrl: image.secure_url,
            },
        });

    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: '圖片上傳失敗',
            error: error.message
        });
    }
};