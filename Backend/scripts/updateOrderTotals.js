const mongoose = require('mongoose');
const Order = require('../models/Order');

// Update old orders to add totalAmount
async function updateOrderTotals() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/school-canteen', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Find orders without totalAmount
        const orders = await Order.find({
            $or: [
                { totalAmount: { $exists: false } },
                { totalAmount: null },
                { totalAmount: 0 }
            ]
        });

        console.log(`Found ${orders.length} orders to update`);

        let updated = 0;
        for (const order of orders) {
            // Calculate total from items
            const totalAmount = order.items.reduce((sum, item) => {
                return sum + (item.lineTotal || (item.unitPriceSnapshot * item.quantity) || 0);
            }, 0);

            if (totalAmount > 0) {
                order.totalAmount = totalAmount;
                await order.save();
                updated++;
                console.log(`Updated order ${order.orderNumber} with total: ${totalAmount}`);
            }
        }

        console.log(`\nSuccessfully updated ${updated} orders`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateOrderTotals();
