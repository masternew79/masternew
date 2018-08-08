const mongoose = require('mongoose');
const Joi = require('joi');

const productOrderSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        require: true,
        default: 1,
        min: 1,
        max: 99
    },
});

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    products: {type: [productOrderSchema], required: true},
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
}, {
    timestamps: true
})

function validateOrder(category) {
    const schema = {
        name: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(30).required(),
        passwordConfirm: Joi.string().min(5).max(30),
        favorite: Joi.array()
    }
    return Joi.validate(category, schema);
}
module.exports = mongoose.model('Order', orderSchema);