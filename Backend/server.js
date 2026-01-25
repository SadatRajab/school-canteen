require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const kitchenRoutes = require('./routes/kitchen');

// Connect to MongoDB
connectDB();

const app = express();

// ========== Security Middleware ==========
app.use(helmet());
app.use(mongoSanitize());

// ========== CORS Configuration ==========
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// ========== Body Parser ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== Static Files (Image Uploads) ==========
// Add CORS headers for static files
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== API Routes ==========
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);

// ========== Health Check ==========
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'School Canteen API is running',
        timestamp: new Date().toISOString()
    });
});

// ========== 404 Handler ==========
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ========== Error Handler (Must be last) ==========
app.use(errorHandler);

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   School Canteen API - CASH ONLY System      ║
║   Server running on port ${PORT}                ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
╚═══════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});
