const { selectCategories, selectReviews, selectReview, selectComments } = require("./model.js");

exports.getCategories = (req, res) => {
    selectCategories().then(categories => res.status(200).send({ categories: categories }));
};

exports.getReviews = (req, res) => {
    selectReviews().then(reviews => res.status(200).send({ reviews: reviews }));
};

exports.getReview = (req, res, next) => {
    selectReview(req.params.review_id).then(review => res.status(200).send({ review: review }))
        .catch(err => next(err));
};

exports.getComments = (req, res, next) => {
    selectComments(req.params.review_id).then(comments => res.status(200).send({ comments }))
        .catch(err => next(err));
};