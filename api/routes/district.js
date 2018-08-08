const express = require('express');
const router = express.Router();

const districtController = require('../controllers/districts');

router.get('/:parentCode', districtController.index);

module.exports = router;