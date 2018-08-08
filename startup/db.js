const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {
    mongoose.connect(`mongodb+srv://masternew:${ process.env.ATLAS_PASSWORD }@cluster0-co5ve.mongodb.net/test`)
        .then(() => winston.info('Connected to DB....'))
}