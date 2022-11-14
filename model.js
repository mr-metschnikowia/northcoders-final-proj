const db = require("./db/connection");

exports.selectCategories = () => {
    return db.query("SELECT * FROM categories;")
        .then(({ rows }) => rows);
};

exports.selectReviews = () => {
    return db.query("SELECT owner, title, review_id, category, review_img_url, created_at, votes, designer,  (SELECT COUNT(comment_id) FROM comments WHERE reviews.review_id = comments.review_id) as comment_count FROM reviews ORDER BY created_at DESC;")
        .then(({ rows }) => rows);
};