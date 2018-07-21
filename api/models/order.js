const mongoose = require('mongoose');

const productOrderSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        // refPath: 'Product._id',
        ref: 'Product',
        require: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 99
    },
});

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    products: {type: [productOrderSchema], required: true},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);