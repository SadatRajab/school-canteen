const mongoose = require('mongoose');
const Order = require('../models/Order');

async function checkOrder11() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school-canteen');
        console.log('Connected to MongoDB\n');

        const order = await Order.findOne({ orderNumber: 11 });

        if (!order) {
            console.log('Order #11 not found');
        } else {
            console.log('Order #11 Details:');
            console.log(`Status: ${order.status}`);
            console.log(`Total Amount: ${order.totalAmount}`);
            console.log(`Timezone: ${order.timezone}`);
            console.log(`Order Date: ${order.orderDate}`);
            console.log('Items:');
            order.items.forEach(item => {
                console.log(`  - ${item.nameSnapshotEn} x${item.quantity}`);
                console.log(`    Unit Price: ${item.unitPriceSnapshot}`);
                console.log(`    Line Total: ${item.lineTotal}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOrder11();
