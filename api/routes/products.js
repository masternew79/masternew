const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage,
    fileFilter
})
const fields = [
    {name: 'image', maxCount: 1},
    // {name: 'subImage', maxCount: 10}
];

const productController = require('../controllers/products');
const checkAuth = require('../middlewares/check-auth');

router.get('/', productController.index);

router.post('/', checkAuth.admin, upload.fields(fields), productController.store);

router.get('/:id', checkAuth.admin, productController.show);

router.patch('/:id', checkAuth.admin, productController.update);

router.delete('/:id', checkAuth.admin, productController.destroy);

module.exports = router;