const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        default: 0  
    },
    saleTime: {
        type: Date,
        default: ''
    },
    categoryId: {
        type: String,
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
    parameter: {
        type: Array,
        default: []
    },
    intro: {
        type: String,
        default: ''
    },
    priority: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);