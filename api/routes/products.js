const express = require('express');
const router = express.Router();


const productController = require('../controllers/products');
const checkAuth = require('../../middlewares/check-auth');
const upload = require('../../helpers/upload')

const fields = [
    {name: 'image', maxCount: 1},
    {name: 'subImage', maxCount: 10}
];

router.get('/', productController.index);

router.post('/',  checkAuth.admin, upload.fields(fields), productController.store);

router.get('/:id', productController.show);

router.put('/:id',  checkAuth.admin, upload.fields(fields), productController.update);

router.delete('/:id', checkAuth.admin, productController.destroy);

module.exports = router;