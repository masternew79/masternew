const {Category, validate} = require('../models/category');

module.exports = {
    // GET /
    index: async (req, res) => {
        const categories = await Category.find({}).select('-__v');
        if (categories.length == 0) return res.status(404).json({ message: 'Not entries found'});

        res.send(categories);
    },
    // POST /
    store: async (req, res) => {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message)

        let category = new Category({
            name: req.body.name,
        })

        category = await category.save()
        res.status(201).send("Storage successfully");
    },
    // PUT, PATCH
    update: async (req, res) => {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send("The category with the given ID was not found");

        category.name = req.body.name;
        await category.save();

        res.status(200).send('Updated successfully');
    },
    // DELETE
    destroy: async (req, res) => {
        const category = await Category.findByIdAndRemove({_id: req.params.id});
        if(!category) return res.status(404).send("The category with the given ID was not found");

        res.send('Deleted successfully');
    }
}