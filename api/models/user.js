const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    avatar: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: 'Customer'
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    favorite: {
        type: Array,
        default: []
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false}
}, {
    timestamp: true
})

module.exports = mongoose.model('User', userSchema);