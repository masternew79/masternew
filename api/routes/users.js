const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');

router.get('/', userController.index);

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/:id', userController.show);

router.delete('/:id', userController.destroy);


module.exports = router;