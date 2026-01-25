const mongoose = require('mongoose');
const Order = require('../models/Order');

async function checkOrders() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school-canteen');
        console.log('Connected to MongoDB\n');

        const orders = await Order.find().sort({ createdAt: -1 }).limit(3);

        orders.forEach(order => {
            console.log('='.repeat(60));
            console.log(`Order #${order.orderNumber}`);
            console.log(`Status: ${order.status}`);
            console.log(`Total Amount: ${order.totalAmount}`);
            console.log('Items:');
            order.items.forEach(item => {
                console.log(`  - ${item.nameSnapshotEn} x${item.quantity}`);
                console.log(`    Unit Price: ${item.unitPriceSnapshot}`);
                console.log(`    Line Total: ${item.lineTotal}`);
            });
            console.log('='.repeat(60));
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOrders();
