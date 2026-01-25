const express = require('express');
const router = express.Router();
const {
    createOrder,
    getTodayOrders,
    getOrder
} = require('../controllers/orderController');
const { validate, createOrderSchema } = require('../middleware/validation');

// Public routes
router.post('/', validate(createOrderSchema), createOrder);
router.get('/today', getTodayOrders);
router.get('/:id', getOrder);

module.exports = router;
