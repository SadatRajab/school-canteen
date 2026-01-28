const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

/**
 * @desc    Upload and optimize image
 * @route   POST /api/admin/upload
 * @access  Private/Admin
 */
exports.uploadMiddleware = upload.single('file');

exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Optimize image with sharp
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'school-canteen',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image to Cloudinary',
                        error: error.message
                    });
                }

                res.status(200).json({
                    success: true,
                    imageUrl: result.secure_url
                });
            }
        );

        // Pipe the buffer to Cloudinary
        const { Readable } = require('stream');
        const bufferStream = new Readable();
        bufferStream.push(optimizedBuffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);

    } catch (error) {
        next(error);
    }
};
