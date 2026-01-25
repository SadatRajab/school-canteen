const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
    login,
    getTodayProfit,
    getTotalProfit
} = require('../controllers/adminController');

const {
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const {
    getOrdersByDate,
    markOrderDelivered
} = require('../controllers/orderController');

const {
    uploadMiddleware,
    uploadImage
} = require('../controllers/uploadController');

const protectAdmin = require('../middleware/authAdmin');
const { validate, adminLoginSchema, productSchema } = require('../middleware/validation');

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ========== Public Admin Routes ==========
router.post('/login', loginLimiter, validate(adminLoginSchema), login);

// ========== Protected Admin Routes ==========
// All routes below require authentication

// Products management
router.post('/products', protectAdmin, validate(productSchema), createProduct);
router.put('/products/:id', protectAdmin, validate(productSchema), updateProduct);
router.delete('/products/:id', protectAdmin, deleteProduct);

// Orders management
router.get('/orders', protectAdmin, getOrdersByDate);
router.patch('/orders/:id/deliver', protectAdmin, markOrderDelivered);

// Profit/Revenue
router.get('/profit/today', protectAdmin, getTodayProfit);
router.get('/profit/total', protectAdmin, getTotalProfit);

// Image upload
router.post('/upload', protectAdmin, uploadMiddleware, uploadImage);

module.exports = router;
