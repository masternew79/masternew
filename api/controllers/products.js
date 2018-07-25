const mongoose = require('mongoose');
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');

const Product = require('../models/product');
const serviceAccount = require('./../../mn-shop-firebase.json')
const config = require('../../config');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "mn-shop.appspot.com"
});

const bucket = admin.storage().bucket();

const optionsPublicURL = {
    action: 'read',
    expires: '03-17-2025',
};

var optionsUpdate = {
    // Return the document after updates are applied
    new: true,
    // Create a document if one isn't found. Required
    // for `setDefaultsOnInsert`
    upsert: true,
    setDefaultsOnInsert: true
};

async function uploadFirebase(path) {
    try {
        // Upload to bucket
        const responseUpload = await bucket.upload(path);
        // Get name of file just upload
        const filenameOnBucket = responseUpload[0].name;
        // Get public url return []
        const publicUrl = await bucket.file(filenameOnBucket).getSignedUrl(optionsPublicURL);

        fs.unlinkSync(path)

        console.log(publicUrl);

        return publicUrl[0];
    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = {
    // GET
    index: async (req, res, next) => {
        try {
            const limit = req.query.limit ? +req.query.limit : 20;
            const page = req.query.page ? +req.query.page : 1;

            // Default order by priority desc
            let order = {'priority': -1};
            if (req.query.price) {
                const orderByPrice = req.query.price;
                if (orderByPrice == 'desc') {
                    order = {'price': -1};
                } else {
                    order = {'price': 1};
                }
            }
            // Conditions of find()
            let conditions = {};
            // Use to search
            if (req.query.key) {
                conditions.name = new RegExp(req.query.key, 'i');
            }
            // Filter by cate
            if (req.query.cate) {
                conditions.categoryId = req.query.cate;
            }
            // Filter by price
            if (req.query.max || req.query.min) {
                const max = req.query.max ? req.query.max : 0;
                const min = req.query.min ? req.query.min : 0;

                let priceFilter = {};
                // Client select under
                if (max && !min) {
                    priceFilter.$lt = max
                }
                // Clien select over
                if (!max && min) {
                    priceFilter.$gt = min
                }
                // Client select from to
                if (max && min) {
                    priceFilter.$lte = max
                    priceFilter.$gte = min
                }
                conditions.price = priceFilter
            }

            const totalProducts = await Product
                                        .find(conditions);

            const products = await Product
                                    .find(conditions)
                                    .select('_id name price salePrice categoryId image')
                                    .limit(limit)
                                    .skip(limit * (page - 1))
                                    .sort(order)

            if (products.length > 0) {
                res.status(200).json({ 
                    count: totalProducts.length,
                    currentPage: page,
                    lastPage: Math.ceil(totalProducts.length / limit),
                    data: products.map( product => {
                        return {
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            salePrice: product.salePrice,
                            image: product.image,
                            categoryId: product.categoryId,
                            url: config.publicPath + 'products/' + product._id
                        };
                    })
                })
            } else {
                res.status(500).json({ message: 'Not entries found'});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error});
        }
    },
    // POST
    store: async (req, res, next) => {
        try {
            // Get path local Image, SubImage
            const imagePath = req.files['image'][0].path;
            const subImagePath = req.files['subImage'].map(
                file => file.path
            );
            // Upload Image to firebase
            const imageUrl = await uploadFirebase(imagePath);
            // Upload subImage to firebase
            let subImageUrl = await Promise.all(
                subImagePath.map( async (path) => {
                    return path = await uploadFirebase(path);
                })
            )

            const newProduct = new Product({
                name: req.body.name,
                price: req.body.price,
                salPrice: req.body.salPrice,
                salTime: req.body.salTime,
                categoryId: req.body.categoryId,
                image: imageUrl,
                subImage: subImageUrl,
                parameter: req.body.parameter,
                intro: req.body.intro
            });
            const product = await newProduct.save();
            res.status(201).json({ message: "Storage successfully" });
        } catch(error) {
            console.log(error);
            res.status(500).json(error);
        }
    },
    // GET
    show: async (req, res, next) => {
        try {
            const id = req.params.id;
            const product = await Product.findById(id).select('_id name price categoryId');
            if (product) {
                res.status(201).json({ data: product });
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error});
        }
    },
    // PATCH
    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const requestBody = req.body;

            let requestFiles = {};
            // Update image from req.files if exist
            if (req.files['image']) {
                const imagePath = req.files['image'][0].path;
                // Upload Image to firebase
                const imageUrl = await uploadFirebase(imagePath);
                requestFiles.image = imageUrl
            }
            // Update subImage from req.files if exist
            if (req.files['subImage']) {
                const subImagePath = req.files['subImage'].map(
                    file => file.path
                );
                let subImageUrl = await Promise.all(
                    subImagePath.map( async (path) => {
                        return path = await uploadFirebase(path);
                    })
                )
                requestFiles.subImage = subImageUrl
            }
            // Concat body + file
            const newProduct = Object.assign(requestFiles, requestBody)
        
            
            const result = await Product.findByIdAndUpdate(id, newProduct, optionsUpdate);
            if (result) {
                res.status(200).json({ message: "Updated successfully"});
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error});
        }
    },
    // updateAll: async (req, res, next) => {
    //     try {
    //         const id = req.params.id;
    //         const requestBody = req.body;

    //         let requestFiles = {};
    //         // Update image from req.files if exist
    //         if (req.files['image'][0]) {
    //             const imagePath = req.files['image'][0].path;
    //             // Upload Image to firebase
    //             const imageUrl = await uploadFirebase(imagePath);
    //             requestFiles.image = imageUrl
    //         }
    //         // Update subImage from req.files if exist
    //         if (req.files['subImage']) {
    //             const subImagePath = req.files['subImage'].map(
    //                 file => file.path
    //             );
    //             let subImageUrl = await Promise.all(
    //                 subImagePath.map( async (path) => {
    //                     return path = await uploadFirebase(path);
    //                 })
    //             )
    //             requestFiles.subImage = subImageUrl
    //         }
    //         // Concat body + file
    //         const newProduct = Object.assign(requestFiles, requestBody)

    //         const result = await Product.findByIdAndUpdate(id, newProduct);
    //         if (result) {
    //             res.status(200).json({ message: "Updated successfully"});
    //         } else {
    //             res.status(500).json({error: "No valid entry found for provide ID"});
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({error});
    //     }
    // },
    // DELETE
    destroy:  async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await Product.findByIdAndRemove({_id: id});
            if (result) {
                res.status(200).json({ message: 'Deleted successfully' });
            } else {
                res.status(500).json({error: "No valid entry found for provide ID"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error});       
        }
    },
}