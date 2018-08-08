const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orders');
const checkAuth = require('../../middlewares/check-auth');

router.get('/', checkAuth.admin, orderController.index);

router.post('/', checkAuth.user, orderController.store);

router.get('/:id', orderController.index);

router.put('/:id', orderController.update);

router.delete('/:id', orderController.destroy);

module.exports = router;