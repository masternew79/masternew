const mongoose = require('mongoose');

const Order = require('../models/order');

module.exports = {
    // GET
    index: async (req, res, next) => {
        try {
            const orders = await Order
                                    .find({})
                                    .select("_id products userId createdAt")
                                    .populate('userId', '_id email')
                                    .populate('products.product', '_id name');
            if (orders.length > 0) {
                res.status(200).json({ 
                    count: orders.length,
                    data: orders
                })
            } else {
                res.status(500).json({ message: 'Not entries found'});
            }
        } catch (error) {
            res.status(500).json({error});
        }        
    },
    // POST
    store: async (req, res, next) => {
        const products = req.body.products;
        console.log(products);
        try {
            const newOrder = new Order({
                _id: mongoose.Types.ObjectId(),
                products: products,
                // products: req.body.products,
                userId: req.body.userId
            });
            const order = await newOrder.save();
            // console.log(order);
            res.status(201).json({ message: "Storage successfully" });
        } catch(error) {
            // console.log(error);
            res.status(500).json(error);
        }
    },
    // GET
    show: async (req, res, next) => {
        try {
            const id = req.params.id;
            const order = await Order.findById(id);
            if (order) {
                res.status(201).json({ data: order });
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
            const newOrder = req.body;
            const result = await Order.findByIdAndUpdate(id, newOrder);
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
    destroy:  async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await Order.findByIdAndRemove({_id: id});
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