const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        nameAr: {
            type: String,
            required: [true, 'Arabic name is required'],
            trim: true
        },
        nameEn: {
            type: String,
            required: [true, 'English name is required'],
            trim: true
        },
        descAr: {
            type: String,
            trim: true,
            default: ''
        },
        descEn: {
            type: String,
            trim: true,
            default: ''
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        category: {
            type: String,
            trim: true,
            default: 'General'
        },
        imageUrl: {
            type: String,
            default: ''
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
productSchema.index({ isAvailable: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
