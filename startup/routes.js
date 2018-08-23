const path = require('path');

const productRoutes = require('../api/routes/products');
const orderRoutes = require('../api/routes/orders');
const userRoutes = require('../api/routes/users');
const provinceRoutes = require('../api/routes/province');
const districtRoutes = require('../api/routes/district');
const wardRoutes = require('../api/routes/ward');
const categoryRoutes = require('../api/routes/categories');
const errorMiddleware = require('../middlewares/error');

module.exports = function (app) {
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(`./views/index.html`));
    });
    app.get('/mn-shop-vue/', (req, res) => {
        res.sendFile(path.resolve(`./views/mn-shop-vue/index.html`));
    });
    app.get('/mn-shop-vue/*', function (req, res) {
        res.sendFile(path.resolve(`./views/mn-shop-vue/index.html`));
    });

    //routes handle request
    app.use('/mn-shop/api/v1/categories', categoryRoutes);
    app.use('/mn-shop/api/v1/products', productRoutes);
    app.use('/mn-shop/api/v1/orders', orderRoutes);
    app.use('/mn-shop/api/v1/users', userRoutes);
    app.use('/mn-shop/api/v1/provinces', provinceRoutes);
    app.use('/mn-shop/api/v1/districts', districtRoutes);
    app.use('/mn-shop/api/v1/wards', wardRoutes);

    // catch route not define
    app.use((req, res, next) => {
        const error = new Error('Page Not found');
        error.status = 404;
        next(error);
    });
    app.use(errorMiddleware);
}