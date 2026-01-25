const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    nameSnapshotAr: {
        type: String,
        required: true
    },
    nameSnapshotEn: {
        type: String,
        required: true
    },
    unitPriceSnapshot: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    lineTotal: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: Number,
            required: true
        },
        orderDate: {
            type: String, // YYYY-MM-DD format
            required: true
        },
        timezone: {
            type: String,
            required: true
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: 'Order must contain at least one item'
            }
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['CASH'],
            default: 'CASH'
        },
        status: {
            type: String,
            enum: ['PENDING', 'PREPARING', 'DELIVERED'],
            default: 'PENDING'
        },
        preparingAt: {
            type: Date,
            default: null
        },
        deliveredAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient queries
orderSchema.index({ orderDate: 1, timezone: 1, orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
