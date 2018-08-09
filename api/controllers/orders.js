const mongoose = require('mongoose');

const { Order, validate } = require('../models/order');
const { Province } = require('../models/province');
const { District } = require('../models/district');
const { Ward } = require('../models/ward');
const { Product } = require('../models/product');

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
        // Validate req.body
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const province = await Province.findOne({code: req.body.province});
        if (!province) return res.status(400).send("Could not found province");

        const district = await District.findOne({code: req.body.district, parentCode: req.body.province});
        if (!district) return res.status(400).send("Could not found district of this province");

        const ward = await Ward.findOne({code: req.body.ward, parentCode: req.body.district});
        if (!ward) return res.status(400).send("Could not found ward of this district");

        let items = [];
        for(let item of req.body.items) {
            const product = await Product.findOne({_id: item._id});
            if (!product) return res.status(400).send(`Could not found product with id: ${item._id}`);
            items.push({
                _id: product._id,
                quantity: item.quantity,
                price: product.salePrice ? product.salePrice : product.price
            })
        }
        
        const order = new Order({
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            province: {
                _id: province._id,
                name: province.name,
                code: province.code,
            },
            district: {
                _id: district._id,
                name: district.name,
                code: district.code,
            },
            ward: {
                _id: ward._id,
                name: ward.name,
                code: ward.code,
            },
            items: items
        });
        await order.save();
        
        res.send("Storaged successfully");
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