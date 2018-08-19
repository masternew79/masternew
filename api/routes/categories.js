const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categories');
const { cache } = require('../../middlewares/cache');

router.get('/', cache, categoryController.index);

router.post('/', categoryController.store);

router.put('/:id', categoryController.update);

router.delete('/:id', categoryController.destroy);

module.exports = router;