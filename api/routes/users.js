const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const checkAuth = require('../../middlewares/check-auth');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/profile', checkAuth.user, userController.show);

router.post('/token', checkAuth.user, userController.token);

router.put('/:id', checkAuth.user, userController.update);

module.exports = router;