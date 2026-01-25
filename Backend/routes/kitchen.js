const express = require('express');
const router = express.Router();
const {
    getTodayKitchenOrders,
    startPreparing,
    markDelivered,
    cancelOrder,
    getKitchenOrders
} = require('../controllers/kitchenController');

/**
 * Kitchen routes - NO PRICES, NO TOTALS exposed
 * These endpoints are designed for kitchen staff to view orders and manage preparation
 */

// Get today's active kitchen orders (PENDING & PREPARING)
router.get('/orders/today', getTodayKitchenOrders);

// Get kitchen orders with optional filters
router.get('/orders', getKitchenOrders);

// Start preparing an order (PENDING → PREPARING)
router.patch('/orders/:id/start', startPreparing);

// Mark order as delivered (PREPARING → DELIVERED)
router.patch('/orders/:id/deliver', markDelivered);

// Cancel/reject order (PENDING → CANCELLED)
router.patch('/orders/:id/cancel', cancelOrder);

module.exports = router;
