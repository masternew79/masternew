const admin = require('firebase-admin');
const fs = require('fs');
const { Product, validate } = require('../models/product');
const { Category } = require('../models/category');
const serviceAccount = require('./../../mn-shop-firebase.json');
const { flatCache } = require('../../middlewares/cache');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "mn-shop.appspot.com"
});

const bucket = admin.storage().bucket();

const optionsPublicURL = {
    action: 'read',
    expires: '03-17-2025',
};

async function uploadFirebase(path) {
    try {
        // Upload to bucket
        const responseUpload = await bucket.upload(path);
        // Get name of file just upload
        const filenameOnBucket = responseUpload[0].name;
        // Get public url return []
        const publicUrl = await bucket.file(filenameOnBucket).getSignedUrl(optionsPublicURL);
        // Delete file
        fs.unlinkSync(path)

        return publicUrl[0];
    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = {
    // GET
    index: async (req, res, next) => {
        const limit = req.query.limit ? +req.query.limit : 20;
        const page = req.query.page ? +req.query.page : 1;
        // Default order by priority desc
        let order = {'priority': -1};
        if (req.query.price)
            req.query.price == 'desc' ? order = {'price': -1} : order = {'price': 1}

        // Conditions: name, categoryId
        let conditions = {
            isPublished: true
        };
        // Use to search
        if (req.query.key) {
            conditions.name = new RegExp(req.query.key, 'i');
        }
        // Filter by cate
        if (req.query.cate) {
            conditions['category._id'] = req.query.cate;
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
        const count = await Product.count(conditions);
        if (!count) return res.status(404).send('Not entries found')

        const products = await Product
                                .find(conditions)
                                .select('-subImage -saleTime -parameter -intro -isPublished -tag -priority -__v -createdAt -updatedAt')
                                .limit(limit)
                                .skip(limit * (page - 1))
                                .sort(order)

        res.status(200).json({ 
            count: count,
            currentPage: page,
            lastPage: Math.ceil(count / limit),
            data: products
        })
    },
    // POST
    store: async (req, res) => {
        // Validate req.body
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const category = await Category.findById(req.body.categoryId);
        if (!category) return res.status(400).send("Invalid category");
        // Remove categoryId from req.body
        delete req.body.categoryId;

        // Get path local Image, SubImage
        const imagePath = req.files['image'][0].path;
        if (!imagePath) return res.status(400).send("Image is required");
        // Upload Image to firebase
        const imageUrl = await uploadFirebase(imagePath);

        // Get path local SubImage
        const subImagePath = req.files['subImage'].map( file => file.path );
        if (!subImagePath) return res.status(400).send("subImage are required");
        // Upload subImage to firebase
        let subImageUrl = await Promise.all(subImagePath.map(
            async (path) => await uploadFirebase(path)
        ));

        let product = new Product(req.body);
        product.category = {
            _id: category._id,
            name: category.name
        };
        product.image = imageUrl;
        product.subImage = subImageUrl;
        await product.save();

        // Clear cache
        flatCache.clearCacheById('MNShopCache');
        
        res.status(201).send(product);
    },
    // GET
    show: async (req, res) => {
        const product = await Product.findOne({_id: req.params.id}).select('-__v');
        if(!product) return res.status(400).send("Invalid product ID");
        // View +1
        product.view++;
        await product.save();

        res.status(200).json({ data: product });
    },
    // PATCH
    update: async (req, res) => {
        // Validate req.body
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let requestFiles = {};
        // Check update images
        if (req.files) {
            if (req.files['image']) {
                const imagePath = req.files['image'][0].path;
                // Upload Image to firebase
                const imageUrl = await uploadFirebase(imagePath);
                requestFiles.image = imageUrl
            }
            // Update subImage from req.files if exist
            if (req.files['subImage']) {
                const subImagePath = req.files['subImage'].map( file => file.path );
                let subImageUrl = await Promise.all(
                    subImagePath.map( async (path) => await uploadFirebase(path))
                );
                requestFiles.subImage = subImageUrl
            }
        }

        // Concat body + file
        let product = Object.assign(requestFiles, req.body)

        if (product.categoryId) {
            const category = await Category.findById(product.categoryId);
            if (!category) return res.status(400).send("Invalid category");
            // Remove categoryId from product:object use to update
            delete product.categoryId;
            product.category = {
                _id: category._id,
                name: category.name,
            }
        }
            
        product = await Product.findByIdAndUpdate(req.params.id, product, { new: true });
        if (!product) return res.status(500).send("No valid entry found for provide ID");
        // Clear cache
        flatCache.clearCacheById('MNShopCache');

        res.status(200).json({ data: product});
    },
    // DELETE
    destroy:  async (req, res) => {
        const product = await Product.findByIdAndRemove({_id: id});
        if (!product) return res.status(500).send("No valid entry found for provide ID");
        
        res.status(200).json({ data: product});
    },

    // updateAll: async (req, res, next) => {
    //     try {
    //     const products = await Product.find({});
    //     console.log(products.length);
    //     for (let i = 0; i < products.length; i++) {
    //         const parameter = {
    //             "WEIGHT": "163g",
    //             "PRODUCT DIMENSIONS (INCHES)": "9.34 x 6.65 x 0.24 inches",
    //             "INTERNAL MEMORY": "4GB(RAM) + 32 GB",
    //             "OS": "Android™ 7.0",
    //             "BATTERY TYPE AND SIZE": "Li-Ion 6000mAh",
    //             "BLUETOOTH": "Bluetooth v4.2",
    //             "MAIN DISPLAY SIZE": "158.0mm (6.2 full rectangle) / 154.5mm (6.1 rounded corners)"
    //         }
    //         console.log( products[i]._id);
    //         console.log( products[i].name);
    //         console.log( urlSlug(products[i].name) );
    //         const result = await Product.findByIdAndUpdate({_id: products[i]._id},
    //             {$set: { parameter: parameter}});
    //         //     console.log(result);
    //     }
    //     res.status(200).json({ message: "Updated successfully"});
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({error: "No valid entry found for provide ID"});
        
    // }
    // },
    
}