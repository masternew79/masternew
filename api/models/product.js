const mongoose = require('mongoose');
const Joi = require('joi');
const URLSlugs = require('mongoose-url-slugs');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 200,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    salePrice: {
        type: Number,
        default: 0,
        min: 0
    },
    saleTime: {
        type: Date,
        default: ''
    },
    category: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 3,
                maxlength: 50
            }
        }),
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    subImage: {
        type: Array,
        default: []
    },
    tags: {
        type: Array,
        default: []
    },
    parameter: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    intro: {
        type: String,
        default: ''
    },
    priority: {
        type: Number,
        default: 0,
        min: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    view: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Add slug field
productSchema.plugin(URLSlugs('name', { update: true, recreate: true }))

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = {
        name: Joi.string().min(5).max(200).required(),
        price: Joi.number().min(0).required(),
        categoryId: Joi.objectId().required(),
        salPrice: Joi.number().min(0),
        intro: Joi.string().min(5),
        parameter: Joi.object(),
        isPublished: Joi.boolean(),
        priority: Joi.number().min(0),
        subImage: Joi.array(),
        tags: Joi.array(),
        image: Joi.string()
    }
    return Joi.validate(product, schema);
}

exports.productSchema = productSchema;
exports.Product = Product;
exports.validate = validateProduct;
