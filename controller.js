const { selectCategories, selectReviews } = require("./model.js");

exports.getCategories = (req, res) => {
    selectCategories().then(categories => res.status(200).send({ categories: categories }));
};

exports.getReviews = (req, res) => {
    selectReviews().then(reviews => res.status(200).send({ reviews: reviews }));
};