const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// CONFIG
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/logging')();

module.exports = app;