const mongoose = require('mongoose');

const wardSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    slug: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 1,
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
        minlength: 1,
        maxlength: 100
    },
    code: { 
        type: String, 
        required: true,
        trim: true,
    },
    parentCode: { 
        type: String, 
        required: true,
        trim: true,
    },
})

exports.Ward = mongoose.model('Ward', wardSchema);