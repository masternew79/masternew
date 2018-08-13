const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    favorites: {
        type: Array,
        default: []
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamp: true
});

// Validate input
function validateUser(category) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(30).required(),
        passwordConfirm: Joi.string().min(5).max(30),
        favorite: Joi.array()
    }
    return Joi.validate(category, schema);
}

exports.User = mongoose.model('User', userSchema);
exports.validate = validateUser;