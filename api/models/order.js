const mongoose = require('mongoose');
const Joi = require('joi');

const schemaAddress = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true
    }
});

const schemaItem = mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 99
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
})

const orderSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    },
    phone: {
        type: String,
        maxlength: 20,
        required: true
    },
    address: {
        type: String,
        minlength: 5,
        maxlength: 255,
        required: true
    },
    province: {
        type: schemaAddress,
        required: true
    },
    district: {
        type: schemaAddress,
        required: true
    },
    ward: {
        type: schemaAddress,
        required: true
    },
    items: {
        type: [schemaItem],
        required: true
    }
});

const Order = mongoose.model('Order', orderSchema);

function validateOrder(category) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().max(20).required(),
        address: Joi.string().min(5).max(255).required(),
        province: Joi.string().required(),
        district: Joi.string().required(),
        ward: Joi.string().required(),
        items: Joi.array().required()
    }
    return Joi.validate(category, schema);
}

exports.Order = Order; 
exports.validate = validateOrder;