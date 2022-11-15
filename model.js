const db = require("./db/connection");

exports.selectCategories = () => {
    return db.query("SELECT * FROM categories;")
        .then(({ rows }) => rows);
};

exports.selectReviews = () => {
    return db.query("SELECT owner, title, review_id, category, review_img_url, created_at, votes, designer,  (SELECT COUNT(comment_id) FROM comments WHERE reviews.review_id = comments.review_id) as comment_count FROM reviews ORDER BY created_at DESC;")
        .then(({ rows }) => rows);
};

exports.selectReview = (review_id) => {
    return db.query("SELECT * FROM reviews WHERE review_id = $1", [review_id])
        .then(({ rows }) => rows[0] === undefined ? Promise.reject({ status: 404, msg: "valid id not found" }) : rows[0])
};

exports.selectComments = (review_id) => {
    return db.query("SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC", [review_id])
        .then(({ rows }) => rows[0] === undefined ? Promise.reject({ status: 404, msg: "no comments found associated with this id" }) : rows)
};

exports.insertComment = (review_id, review) => {
    return db.query('INSERT INTO comments (author, body, review_id) VALUES ($1, $2, $3) RETURNING* ;',
        [review.username, review.body, review_id])
        .then(({ rows }) => rows[0])
};

exports.updateReview = (review_id, review) => {
    return db.query('UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *',
        [review.inc_votes, review_id])
        .then(({ rows }) => rows[0] === undefined ? Promise.reject({ status: 404, msg: "review id not found" }) : rows[0])
};