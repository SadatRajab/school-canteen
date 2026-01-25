const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const { getOrderDate, getTimezoneOrDefault } = require('../utils/timezone');

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email matches admin email from env
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password against stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
        );

        res.status(200).json({
            success: true,
            token,
            admin: {
                email
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get today's profit/revenue (delivered orders only)
 * @route   GET /api/admin/profit/today
 * @access  Private/Admin
 */
exports.getTodayProfit = async (req, res, next) => {
    try {
        const timezone = getTimezoneOrDefault(req);
        const orderDate = getOrderDate(timezone);

        const result = await Order.aggregate([
            {
                $match: {
                    orderDate,
                    status: 'DELIVERED'
                }
            },
            {
                $group: {
                    _id: null,
                    deliveredOrdersCount: { $sum: 1 },
                    revenueToday: { $sum: '$totalAmount' }
                }
            }
        ]);

        const data = result.length > 0 ? result[0] : {
            deliveredOrdersCount: 0,
            revenueToday: 0
        };

        res.status(200).json({
            success: true,
            date: orderDate,
            timezone,
            data: {
                deliveredOrdersCount: data.deliveredOrdersCount,
                revenueToday: data.revenueToday
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get total profit/revenue (all delivered orders)
 * @route   GET /api/admin/profit/total
 * @access  Private/Admin
 */
exports.getTotalProfit = async (req, res, next) => {
    try {
        const result = await Order.aggregate([
            {
                $match: {
                    status: 'DELIVERED'
                }
            },
            {
                $group: {
                    _id: null,
                    deliveredOrdersCount: { $sum: 1 },
                    revenueTotal: { $sum: '$totalAmount' }
                }
            }
        ]);

        const data = result.length > 0 ? result[0] : {
            deliveredOrdersCount: 0,
            revenueTotal: 0
        };

        res.status(200).json({
            success: true,
            data: {
                deliveredOrdersCount: data.deliveredOrdersCount,
                revenueTotal: data.revenueTotal
            }
        });
    } catch (error) {
        next(error);
    }
};
