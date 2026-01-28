const Order = require('../models/Order');
const { getOrderDate, getTimezoneOrDefault } = require('../utils/timezone');

/**
 * @desc    Get today's kitchen orders (PENDING & PREPARING only)
 * @route   GET /api/kitchen/orders/today
 * @access  Public/Kitchen (no prices exposed)
 */
exports.getTodayKitchenOrders = async (req, res, next) => {
    try {
        const timezone = getTimezoneOrDefault(req);
        const orderDate = getOrderDate(timezone);

        // Fetch only PENDING and READY orders for today
        const orders = await Order.find({
            orderDate,
            timezone,
            status: { $in: ['PENDING', 'READY'] }
        })
            .sort({ orderNumber: 1 })
            .select('orderNumber createdAt status items readyAt totalAmount')
            .lean();

        // Transform orders to expose only kitchen-relevant data
        const kitchenOrders = orders.map(order => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            status: order.status,
            readyAt: order.readyAt,
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
                nameSnapshotEn: item.nameSnapshotEn,
                nameSnapshotAr: item.nameSnapshotAr,
                quantity: item.quantity
                // NOTE: Individual item prices not exposed, only total
            }))
        }));

        console.log('Kitchen orders with totals:', JSON.stringify(kitchenOrders, null, 2));

        res.status(200).json({
            success: true,
            count: kitchenOrders.length,
            orderDate,
            timezone,
            data: kitchenOrders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark order as ready (PENDING → READY)
 * @route   PATCH /api/kitchen/orders/:id/start
 * @access  Public/Kitchen
 */
exports.startPreparing = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate state transition
        if (order.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Cannot mark as ready. Order is already ${order.status}`
            });
        }

        // Update status to READY
        order.status = 'READY';
        order.readyAt = new Date();
        await order.save();

        // Return kitchen-safe data (no prices)
        res.status(200).json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                readyAt: order.readyAt,
                items: order.items.map(item => ({
                    nameSnapshotEn: item.nameSnapshotEn,
                    nameSnapshotAr: item.nameSnapshotAr,
                    quantity: item.quantity
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark order as delivered (READY → DELIVERED)
 * @route   PATCH /api/kitchen/orders/:id/deliver
 * @access  Public/Kitchen
 */
exports.markDelivered = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // يمكن تسليم الطلب من أي حالة (PENDING أو READY)
        if (!['PENDING', 'READY'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot mark as delivered. Order is ${order.status}`
            });
        }

        // Update status to DELIVERED
        order.status = 'DELIVERED';
        order.deliveredAt = new Date();
        await order.save();

        // Return kitchen-safe data (no prices)
        res.status(200).json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveredAt: order.deliveredAt,
                items: order.items.map(item => ({
                    nameSnapshotEn: item.nameSnapshotEn,
                    nameSnapshotAr: item.nameSnapshotAr,
                    quantity: item.quantity
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel/reject order (PENDING → CANCELLED)
 * @route   PATCH /api/kitchen/orders/:id/cancel
 * @access  Public/Kitchen
 */
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // يمكن إلغاء الطلب من حالة PENDING فقط
        if (order.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel. Order is ${order.status}`
            });
        }

        // Update status to CANCELLED
        order.status = 'CANCELLED';
        await order.save();

        // Return kitchen-safe data (no prices)
        res.status(200).json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all kitchen orders by date (for kitchen history/review)
 * @route   GET /api/kitchen/orders
 * @access  Public/Kitchen
 */
exports.getKitchenOrders = async (req, res, next) => {
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
            // Kitchen can only see PENDING, PREPARING, or DELIVERED
            if (['PENDING', 'PREPARING', 'DELIVERED'].includes(status)) {
                filter.status = status;
            }
        }

        const orders = await Order.find(filter)
            .sort({ orderNumber: 1 })
            .select('orderNumber createdAt status items preparingAt deliveredAt')
            .lean();

        // Transform to kitchen-safe format
        const kitchenOrders = orders.map(order => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            status: order.status,
            preparingAt: order.preparingAt,
            deliveredAt: order.deliveredAt,
            items: order.items.map(item => ({
                nameSnapshotEn: item.nameSnapshotEn,
                nameSnapshotAr: item.nameSnapshotAr,
                quantity: item.quantity
            }))
        }));

        res.status(200).json({
            success: true,
            count: kitchenOrders.length,
            data: kitchenOrders
        });
    } catch (error) {
        next(error);
    }
};
