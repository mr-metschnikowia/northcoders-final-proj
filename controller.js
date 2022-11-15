const { selectCategories, selectReviews, selectReview, selectComments, insertComment, updateReview, selectUsers } = require("./model.js");

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

exports.postComment = (req, res, next) => {
    insertComment(req.params.review_id, req.body).then(comment =>
        res.status(201).send({ comment }))
        .catch(err => next(err))
}

exports.patchReview = (req, res, next) => {
    updateReview(req.params.review_id, req.body)
        .then(review => res.status(200).send({ review }))
        .catch(err => next(err));
};

exports.getUsers = (req, res) => {
    selectUsers().then(users => res.status(200).send({ users }))
};

// request validation

exports.validateComment = (req, res, next) => {
    if (req.body.body.length < 1) {
        res.status(400).send({ msg: "body can't be empty" });
    }
    else {
        next();
    }
}

exports.validateReviewUpdate = (req, res, next) => {
    if (req.body.inc_votes === undefined) {
        res.status(400).send({ msg: "data missing from request body" });
    }
    else {
        next();
    }
}