const { Province } = require('../models/province');

module.exports = {
    // GET /
    index: async (req, res) => {
        const provinces = await Province.find({}).select('-__v');
        if (provinces.length == 0) return res.status(404).json({ message: 'Not entries found'});

        res.send(provinces);
    },
    // POST /
    // store: async (req, res) => {
    //     const provinces = Object.values(provincesJson);
    //     for (const province of provinces) {
    //         let newProvince = new Province({
    //             name: province.name,
    //             slug: province.slug,
    //             type: province.type,
    //             code: province.code,
    //             nameWithType: province.name_with_type,
    //         })  
    //         await newProvince.save()
    //     }
    //     res.send("success");
    // }
}