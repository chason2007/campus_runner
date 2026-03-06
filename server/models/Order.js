const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a buyer']
    },
    runnerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    items: [
        {
            name: {
                type: String,
                required: [true, 'Item must have a name']
            },
            qty: {
                type: Number,
                required: [true, 'Item must have a quantity'],
                min: [1, 'Quantity must be at least 1']
            }
        }
    ],
    category: {
        type: String,
        enum: ['Food', 'Stationery', 'Printout'],
        required: [true, 'Order must have a category']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Delivered'],
        default: 'Pending'
    },
    deliveryFee: {
        type: Number,
        required: [true, 'Order must have a delivery fee']
    },
    pickupLocation: {
        type: String,
        required: [true, 'Order must have a pickup location']
    },
    deliveryLocation: {
        type: String,
        required: [true, 'Order must have a delivery location']
    },
    fileUrl: {
        type: String
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
