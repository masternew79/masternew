const { District } = require('../models/district');

module.exports = {
    // GET /
    index: async (req, res) => {
        const districts = await District.find({parentCode: req.params.parentCode}).select('-__v');
        if (districts.length == 0) return res.status(404).json({ message: 'Not entries found'});

        res.send(districts);
    },
    // POST /
    store: async (req, res) => {
        const districts = Object.values(districtsJson);
        for (const district of districts) {
            let newDistrict = new District({
                name: district.name,
                slug: district.slug,
                type: district.type,
                code: district.code,
                parentCode: district.parent_code,
                nameWithType: district.name_with_type,
            })  
            await newDistrict.save()
        }
        // await District.collection.drop();
        res.send("success");
    }
}