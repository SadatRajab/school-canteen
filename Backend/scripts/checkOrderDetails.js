const mongoose = require('mongoose');
const Order = require('../models/Order');

async function checkOrderDetails() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school-canteen');
        console.log('Connected to MongoDB\n');

        const order = await Order.findOne({ orderNumber: 10 });

        console.log('Full Order Details:');
        console.log(JSON.stringify(order, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOrderDetails();
