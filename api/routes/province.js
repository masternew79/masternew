const express = require('express');
const router = express.Router();

const provinceController = require('../controllers/provinces');

router.get('/', provinceController.index);

module.exports = router;