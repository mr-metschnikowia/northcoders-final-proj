const express = require('express');

const {
    getCategories,
    getReviews,
    getReview,
    getComments,
    postComment,
    validateComment,
    patchReview,
    validateReviewUpdate,
    getUsers,
    validateReviewsQueries
} = require('./controller');

const app = express();

app.use(express.json());

app.get('/api/categories', getCategories);
app.get('/api/reviews', validateReviewsQueries, getReviews);
app.get('/api/reviews/:review_id', getReview);
app.get('/api/reviews/:review_id/comments', getComments);
app.post('/api/reviews/:review_id/comments', validateComment, postComment);
app.patch('/api/reviews/:review_id', validateReviewUpdate, patchReview)
app.get('/api/users', getUsers);

app.all('/*', (req, res) => {
    res.status(404).send({ msg: 'Route not found' });
});
// route doesn't exist 

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else next(err)
})
// handle custom error

app.use((err, req, res, next) => {
    if (err.code === "23503") {
        res.status(400).send({ msg: "invalid identifier" })
    } else if (err.code === "22P02") {
        res.status(400).send({ msg: "invalid data type" })
    } else next(err);
})
// handle psql error

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "internal server error" })
})
// handle internal server errors

module.exports = app;
