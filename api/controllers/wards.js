const { Ward } = require('../models/ward');

module.exports = {
    // GET /
    index: async (req, res) => {
        const wards = await Ward.find({parentCode: req.params.parentCode}).select('-__v');
        if (wards.length == 0) return res.status(404).json({ message: 'Not entries found'});

        res.send(wards);
    }
}