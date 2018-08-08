const mongoose = require('mongoose');

const provinceSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    slug: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    type: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 20
    },
    nameWithType: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    code: { 
        type: String, 
        required: true,
        trim: true,
    },
})

exports.Province = mongoose.model('Province', provinceSchema);