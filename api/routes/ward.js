const express = require('express');
const router = express.Router();

const wardController = require('../controllers/wards');

router.get('/:parentCode', wardController.index);

module.exports = router;