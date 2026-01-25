const Order = require('../models/Order');
const Product = require('../models/Product');
const Counter = require('../models/Counter');
const { getOrderDate, getTimezoneOrDefault } = require('../utils/timezone');

/**
 * @desc    Create new order (public)
 * @route   POST /api/orders
 * @access  Public
 */
exports.createOrder = async (req, res, next) => {
    try {
        const { items } = req.body;

        // CRITICAL: Reject if client tries to set paymentMethod
        if (req.body.paymentMethod !== undefined) {
            return res.status(400).json({
                success: false,
                message: 'CASH is the only allowed payment method. Payment method cannot be specified.'
            });
        }

        // Get timezone from header
        const timezone = getTimezoneOrDefault(req);
        const orderDate = getOrderDate(timezone);

        // Validate and calculate totals (SERVER SIDE ONLY)
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            if (!product.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `Product not available: ${product.nameEn}`
                });
            }

            // Use DB price ONLY (never trust client)
            const lineTotal = product.price * item.quantity;

            orderItems.push({
                productId: product._id,
                nameSnapshotAr: product.nameAr,
                nameSnapshotEn: product.nameEn,
                unitPriceSnapshot: product.price,
                quantity: item.quantity,
                lineTotal
            });

            totalAmount += lineTotal;
        }

        // Generate atomic queue number
        const counterId = `${orderDate}|${timezone}`;
        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { seq: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Create order with CASH payment only
        const order = await Order.create({
            orderNumber: counter.seq,
            orderDate,
            timezone,
            items: orderItems,
            totalAmount,
            paymentMethod: 'CASH', // ENFORCED BY SERVER
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                orderDate: order.orderDate,
                createdAt: order.createdAt,
                status: order.status,
                totalAmount: order.totalAmount,
                paymentMethod: 'CASH'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get today's orders (public, read-only)
 * @route   GET /api/orders/today
 * @access  Public
 */
exports.getTodayOrders = async (req, res, next) => {
    try {
        const timezone = getTimezoneOrDefault(req);
        const orderDate = getOrderDate(timezone);

        const orders = await Order.find({ orderDate, timezone })
            .sort({ orderNumber: 1 })
            .select('orderNumber orderDate status totalAmount createdAt items');

        res.status(200).json({
            success: true,
            count: orders.length,
            orderDate,
            timezone,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single order by ID (public)
 * @route   GET /api/orders/:id
 * @access  Public
 */
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get orders by date (admin)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
exports.getOrdersByDate = async (req, res, next) => {
    try {
        const { date, status } = req.query;
        const timezone = getTimezoneOrDefault(req);

        let filter = {};

        if (date) {
            filter.orderDate = date;
        } else {
            // Default to today
            filter.orderDate = getOrderDate(timezone);
        }

        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .sort({ orderNumber: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark order as delivered (admin)
 * @route   PATCH /api/admin/orders/:id/deliver
 * @access  Private/Admin
 */
exports.markOrderDelivered = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: 'DELIVERED',
                deliveredAt: new Date()
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};
