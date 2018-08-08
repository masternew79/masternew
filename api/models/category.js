const mongoose = require('mongoose');
const Joi = require('joi');
const URLSlugs = require('mongoose-url-slugs');

const categorySchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    priority: {
        type: Number,
        default: 0,
        min: 0
    }
})
// Add slug field
categorySchema.plugin(URLSlugs('name', { update: true, recreate: true }))

// Category model
const Category = mongoose.model('Category', categorySchema);

// Validate input
function validateCategory(category) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        priority: Joi.number().min(0)
    }
    return Joi.validate(category, schema);
}

exports.categorySchema = categorySchema;
exports.Category = Category;
exports.validate = validateCategory;