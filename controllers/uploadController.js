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
// const uploadFromBuffer = (req) => {
//     return new Promise((resolve, reject) => {
//         let cld_upload_stream = cloudinary.uploader.upload_stream(
//             (error, result) => {
//                 if (result) {
//                     resolve(result);
//                     console.log(result)
//                 } else {
//                     reject(error);
//                 }
//             }
//         );

//         streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
//     });
// };

const uploadFromBuffer = (req) => {
    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: 'product', // 指定上傳到 Cloudinary 的 product 資料夾
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                    console.log(result);
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

// 刪除圖片 API
exports.deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({ error: "缺少 public_id" });
        }

        // 確保 publicId 包含 product 資料夾
        if (!publicId.startsWith("product/")) {
            publicId = `product/${publicId}`;
        }

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