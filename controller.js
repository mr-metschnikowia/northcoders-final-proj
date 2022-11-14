const { selectCategories } = require("./model.js");

exports.getCategories = (req, res) => {
    selectCategories().then(categories => res.status(200).send({ categories: categories }));
};