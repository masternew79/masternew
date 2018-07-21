const mongoose = require('mongoose');

const Category = require('../models/category');
const config = require('../../config');

module.exports = {
    // GET
    index: async (req, res, next) => {
        try {
            const categories = await Category.find({}).select('_id name');
            if (categories.length > 0) {
                res.status(200).json({
                    count: categories.length,
                    data: categories.map( category => {
                        return {
                            id: category._id,
                            name: category.name,
                            url: config.publicPath + 'categories/' + category.id
                        };
                    })
                });
            } else {
                res.status(409).json({ message: 'Not entries found'});
            }
        } catch (error) {
            res.status(500).json({error});
        }
    },
    // POST
    store: async (req, res, next) => {
        try {
            const newCategory = new Category({
                _id: mongoose.Types.ObjectId(),
                name: req.body.name
            });
            const category = await newCategory.save();
            res.status(201).json({ message: "Storage successfully" });
        } catch(error) {
            res.status(500).json(error);
        }
    },
    // GET
    show: async (req, res, next) => {
        try {
            const id = req.params.id;
            const category = await Category.findById(id).select('_id name');
            if (category) {
                res.status(201).json({ data: category });
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            res.status(500).json({error});
        }
    },
    // PUT, PATCH
    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const newCategory = req.body;
            const result = await Category.findByIdAndUpdate(id, newCategory);
            if (result) {
                res.status(200).json({ message: 'Updated successfully'});
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            res.status(500).json({error});
        }
    },
    // DELETE
    destroy: async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await Category.findByIdAndRemove({_id: id});
            if (result) {
                res.status(200).json({ message: 'Deleted successfully' });
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            res.status(500).json({error});    
        }
    }
}