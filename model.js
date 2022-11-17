const db = require("./db/connection");

exports.selectCategories = () => {
    return db.query("SELECT * FROM categories;")
        .then(({ rows }) => rows);
};

exports.selectReviews = (category, sort_by = "created_at", order = "DESC") => {

    let query = 'SELECT owner, title, review_id, category, review_img_url, created_at, votes, designer,  (SELECT COUNT(comment_id) FROM comments WHERE reviews.review_id = comments.review_id) as comment_count FROM reviews';
    let queryVars = [];

    if (category) {
        query += " WHERE category = $1";
        queryVars.push(category);
    }

    query += ` ORDER BY ${sort_by} ${order};`;

    return db.query(query, queryVars)
        .then(({ rows }) => rows[0] === undefined ? Promise.reject({ status: 404, msg: "no review associated with this category" }) : rows);
};

exports.selectReview = (review_id, comment_count) => {

    let query = "SELECT owner, title, review_id, category, review_body, review_img_url, created_at, votes, designer"
    query += comment_count === "true" ? ", (SELECT COUNT(comment_id) FROM comments WHERE reviews.review_id = comments.review_id) as comment_count" : "";
    query += " FROM reviews WHERE review_id = $1"

    return db.query(query, [review_id])
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

exports.selectUsers = () => {
    return db.query("SELECT username, name, avatar_url FROM users;")
        .then(({ rows }) => rows);
};

exports.removeComment = (comment_id) => {
    return db.query("DELETE from comments WHERE comment_id = $1 RETURNING *", [comment_id])
        .then(({ rows }) =>  rows[0] === undefined ? Promise.reject({ status: 404, msg: "comment not found" }) : rows[0])
}