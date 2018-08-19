const path = require('path');

const productRoutes = require('../api/routes/products');
const orderRoutes = require('../api/routes/orders');
const userRoutes = require('../api/routes/users');
const provinceRoutes = require('../api/routes/province');
const districtRoutes = require('../api/routes/district');
const wardRoutes = require('../api/routes/ward');
const categoryRoutes = require('../api/routes/categories');
const errorMiddleware = require('../middlewares/error');

module.exports = function(app) {
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(`./views/index.html`));
    });
    app.get('/trangchu', (req, res) => {
        res.sendFile(path.resolve(`./views/trangchu.html`));
    });
    app.get('/chodatmaychu', (req, res) => {
        res.sendFile(path.resolve(`./views/chodatmaychu.html`));
    });
    app.get('/congnghe', (req, res) => {
        res.sendFile(path.resolve(`./views/congnghe.html`));
    });
    app.get('/giaiphap', (req, res) => {
        res.sendFile(path.resolve(`./views/giaiphap.html`));
    });
    app.get('/lienhe', (req, res) => {
        res.sendFile(path.resolve(`./views/lienhe.html`));
    });
    app.get('/luutrudammay', (req, res) => {
        res.sendFile(path.resolve(`./views/luutrudammay.html`));
    });
    app.get('/maychuluutru', (req, res) => {
        res.sendFile(path.resolve(`./views/maychuluutru.html`));
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