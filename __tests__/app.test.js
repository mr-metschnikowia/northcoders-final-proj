const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const data = require('../db/data/test-data');
const seed = require('../db/seeds/seed');
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));

afterAll(() => {
    return db.end();
});

describe('1. GET /api/categories', () => {
    test('status:200, responds with array of categories', () => {
        return request(app)
            .get('/api/categories')
            .expect(200)
            .then(res => {
                const categories = res.body.categories;
                expect(categories).toHaveLength(4);
                categories.forEach((category) => {
                    expect(category).toEqual(
                        expect.objectContaining({
                            slug: expect.any(String),
                            description: expect.any(String)
                        })
                    );
                });
            });
    });
});

describe('1. General errors', () => {
    test('Invalid endpoint responds with 404 not found', () => {
        return request(app)
            .get('/api/mongeese')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Route not found')
            })
    });
});

describe('2. GET /api/reviews', () => {
    test('status:200, responds with array of reviews', () => {
        return request(app)
            .get('/api/reviews')
            .expect(200)
            .then(res => {
                const reviews = res.body.reviews;
                expect(reviews).toHaveLength(13);
                reviews.forEach((review) => {
                    expect(review).toEqual(
                        expect.objectContaining({
                            title: expect.any(String),
                            review_id: expect.any(Number),
                            category: expect.any(String),
                            review_img_url: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            designer: expect.any(String),
                            comment_count: expect.any(String),
                            owner: expect.any(String),
                        })
                    );
                });
                expect(reviews).toBeSortedBy("created_at", { descending: true, coerce: true, });
            });
    });
});

describe('3. GET /api/reviews/:review_id', () => {
    test('status:200, responds with a single matching review', () => {
        const REVIEW_ID = 2;
        return request(app)
            .get(`/api/reviews/${REVIEW_ID}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: REVIEW_ID,
                    title: 'Jenga',
                    designer: 'Leslie Scott',
                    owner: 'philippaclaire9',
                    review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Fiddly fun for all the family',
                    category: 'dexterity',
                    created_at: new Date(1610964101251).toISOString(),
                    votes: 5
                });
            });
    });
    test('valid id not found', () => {
        return request(app)
            .get('/api/reviews/100')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("valid id not found")
            })

    });
    test('invalid id', () => {
        return request(app)
            .get('/api/reviews/hello')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid data type")
            })
    });
});

describe('4. GET /api/reviews/:review_id/comments', () => {
    test('status:200, responds with array of comments associated with specific review_id sorted by date descending', () => {
        const REVIEW_ID = 3;
        return request(app)
            .get(`/api/reviews/${REVIEW_ID}/comments`)
            .expect(200)
            .then(({ body }) => {
                const comments = body.comments;
                expect(comments).toHaveLength(3);
                comments.forEach((comment) => {
                    expect(comment).toEqual(
                        expect.objectContaining({
                            review_id: REVIEW_ID,
                            body: expect.any(String),
                            votes: expect.any(Number),
                            author: expect.any(String),
                            comment_id: expect.any(Number),
                            created_at: expect.any(String),
                        })
                    );
                });
                expect(comments).toBeSortedBy("created_at", { descending: true, coerce: true, });
            });
    });
    test('valid id not found', () => {
        return request(app)
            .get(`/api/reviews/10/comments`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("no comments found associated with this id")
            })

    });
    test('invalid id', () => {
        return request(app)
            .get(`/api/reviews/hello/comments`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid data type")
            })
    });
});

describe('5. POST /api/reviews/:review_id/comments', () => {
    test('status:201, responds with a new comment added to the database', () => {
        const newComment = {
            username: 'philippaclaire9',
            body: 'this is a briliiant comment! :D'
        };
        return request(app)
            .post('/api/reviews/4/comments')
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
                expect(body.comment).toEqual(
                    expect.objectContaining({
                        comment_id: 7,
                        review_id: 4,
                        author: 'philippaclaire9',
                        body: 'this is a briliiant comment! :D',
                        votes: 0,
                        created_at: expect.any(String)
                    })
                );
            });
    });
    test('status:400, foreign key violation (username)', () => {
        const newComment = {
            username: 'dodgy_user123',
            body: 'this is a briliiant comment! :D'
        };
        return request(app)
            .post('/api/reviews/4/comments')
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid identifier");
            });
    });
    test('status:400, foreign key violation (review_id)', () => {
        const newComment = {
            username: 'philippaclaire9',
            body: 'this is a briliiant comment! :D'
        };
        return request(app)
            .post('/api/reviews/400/comments')
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid identifier");
            });
    });
    test('status:400, data type violation (review_id)', () => {
        const newComment = {
            username: 'philippaclaire9',
            body: 'this is a briliiant comment! :D'
        };
        return request(app)
            .post('/api/reviews/hello/comments')
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid data type");
            });
    });
    test('400 empty body', () => {
        const newComment = {
            username: 'philippaclaire9',
            body: ""
        };
        return request(app)
            .post('/api/reviews/4/comments')
            .send(newComment)
            .expect(400)
            .then(({ body }) => expect(body.msg).toBe("body can't be empty"))
    });  
});

describe('6. PATCH /api/reviews/:review_id', () => {
    it('status:200, responds with the updated review', () => {
        const reviewUpdates = {
            inc_votes: 3
        };
        return request(app)
            .patch('/api/reviews/1')
            .send(reviewUpdates)
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: 1,
                    title: 'Agricola',
                    designer: 'Uwe Rosenberg',
                    owner: 'mallionaire',
                    review_img_url:
                        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Farmyard fun!',
                    category: 'euro game',
                    created_at: new Date(1610964020514).toISOString(),
                    votes: 4
                });
            });
    });
    it('status:400 if given empty object', () => {
        const reviewUpdates = {};
        return request(app)
            .patch('/api/reviews/1')
            .send(reviewUpdates)
            .expect(400)
            .then(({ body }) => expect(body.msg).toBe("data missing from request body"))
    });
    it('ignores irrelevant props in update object', () => {
        const reviewUpdates = {
            inc_votes: 3,
            randomOne: "hallelujah",
            randomTwo: "wassup"
        };
        return request(app)
            .patch('/api/reviews/1')
            .send(reviewUpdates)
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: 1,
                    title: 'Agricola',
                    designer: 'Uwe Rosenberg',
                    owner: 'mallionaire',
                    review_img_url:
                        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Farmyard fun!',
                    category: 'euro game',
                    created_at: new Date(1610964020514).toISOString(),
                    votes: 4
                });
            });
    });
    it('no data associated with review id', () => {
        const reviewUpdates = {
            inc_votes: 3
        };
        return request(app)
            .patch('/api/reviews/100')
            .send(reviewUpdates)
            .expect(404)
            .then(({ body }) => expect(body.msg).toBe("review id not found"))
    });
    it('invalid data type (review id)', () => {
        const reviewUpdates = {
            inc_votes: 3
        };
        return request(app)
            .patch('/api/reviews/hello')
            .send(reviewUpdates)
            .expect(400)
            .then(({ body }) => expect(body.msg).toBe("invalid data type"))
    });
    it('invalid data type (inc-votes)', () => {
        const reviewUpdates = {
            inc_votes: "hello"
        };
        return request(app)
            .patch('/api/reviews/1')
            .send(reviewUpdates)
            .expect(400)
            .then(({ body }) => expect(body.msg).toBe("invalid data type"))
    });
});

describe('7. GET /api/users', () => {
    test('status:200, responds with array of users', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({ body }) => {
                const users = body.users;
                expect(users).toHaveLength(4);
                users.forEach((user) => {
                    expect(user).toEqual(
                        expect.objectContaining({
                            username: expect.any(String),
                            name: expect.any(String),
                            avatar_url: expect.any(String)
                        })
                    );
                });
            });
    });
});

describe("8. comment_count feature", () => {
    test('queries: comment_count, comment count > 0', () => {
        return request(app)
            .get('/api/reviews/2?comment_count=true')
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: 2,
                    title: 'Jenga',
                    designer: 'Leslie Scott',
                    owner: 'philippaclaire9',
                    review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Fiddly fun for all the family',
                    category: 'dexterity',
                    created_at: new Date(1610964101251).toISOString(),
                    votes: 5,
                    comment_count: "3"
                });
            });

    });

    test('queries: comment_count, comment count === 0', () => {
        return request(app)
            .get('/api/reviews/1?comment_count=true')
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: 1, 
                    title: 'Agricola',
                    designer: 'Uwe Rosenberg',
                    owner: 'mallionaire',
                    review_img_url:
                        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Farmyard fun!',
                    category: 'euro game',
                    created_at: new Date(1610964020514).toISOString(),
                    votes: 1,
                    comment_count: "0"
                });
            });

    });

    test('comment count is not true', () => {
        return request(app)
            .get('/api/reviews/2?comment_count=false')
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: 2,
                    title: 'Jenga',
                    designer: 'Leslie Scott',
                    owner: 'philippaclaire9',
                    review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Fiddly fun for all the family',
                    category: 'dexterity',
                    created_at: new Date(1610964101251).toISOString(),
                    votes: 5,
                });
            });
    });

    test('ignore invalid queries', () => {
        return request(app)
            .get('/api/reviews/2?random=monkeys')
            .expect(200)
            .then(({ body }) => {
                expect(body.review).toEqual({
                    review_id: 2,
                    title: 'Jenga',
                    designer: 'Leslie Scott',
                    owner: 'philippaclaire9',
                    review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Fiddly fun for all the family',
                    category: 'dexterity',
                    created_at: new Date(1610964101251).toISOString(),
                    votes: 5,
                });
            });
    });
})

describe("9. Reviews queries", () => {
    describe("queries: category", () => {
        test('valid category, exists', () => {
            return request(app)
                .get('/api/reviews?category=social deduction')
                .expect(200)
                .then(({ body }) => {
                    const reviews = body.reviews;
                    expect(reviews).toHaveLength(11);
                    reviews.forEach((review) => {
                        expect(review).toEqual(
                            expect.objectContaining({
                                title: expect.any(String),
                                review_id: expect.any(Number),
                                category: "social deduction",
                                review_img_url: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                designer: expect.any(String),
                                comment_count: expect.any(String),
                                owner: expect.any(String),
                            })
                        );
                    });
                    expect(reviews).toBeSortedBy("created_at", { descending: true, coerce: true, });
                });
        });

        test('no review associated with this category', () => {
            return request(app)
                .get('/api/reviews?category=rando mando')
                .expect(404)
                .then(({ body }) => expect(body.msg).toBe("no review associated with this category"));
        });
    })

    describe("queries: sort_by", () => {
        test('queries: valid sort_by', () => {
            return request(app)
                .get('/api/reviews?sort_by=comment_count')
                .expect(200)
                .then(({ body }) => {
                    const reviews = body.reviews;
                    expect(reviews).toHaveLength(13);
                    reviews.forEach((review) => {
                        expect(review).toEqual(
                            expect.objectContaining({
                                title: expect.any(String),
                                review_id: expect.any(Number),
                                category: expect.any(String),
                                review_img_url: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                designer: expect.any(String),
                                comment_count: expect.any(String),
                                owner: expect.any(String),
                            })
                        );
                    });
                    expect(reviews).toBeSortedBy("comment_count", { descending: true, coerce: true, });
                });

        });

        test('queries: invalid sort_by', () => {
            return request(app)
                .get('/api/reviews?sort_by=mambo_jambo')
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("column doesn't exist"))
        });
    })

    describe("queries: order_by", () => {
        test('valid order_by asc', () => {
            return request(app)
                .get('/api/reviews?order_by=asc')
                .expect(200)
                .then(({ body }) => {
                    const reviews = body.reviews;
                    expect(reviews).toHaveLength(13);
                    reviews.forEach((review) => {
                        expect(review).toEqual(
                            expect.objectContaining({
                                title: expect.any(String),
                                review_id: expect.any(Number),
                                category: expect.any(String),
                                review_img_url: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                designer: expect.any(String),
                                comment_count: expect.any(String),
                                owner: expect.any(String),
                            })
                        );
                    });
                    expect(reviews).toBeSortedBy("created_at", { coerce: true, });
                });
        });

        test('valid order_by desc', () => {
            return request(app)
                .get('/api/reviews?order_by=desc')
                .expect(200)
                .then(({ body }) => {
                    const reviews = body.reviews;
                    expect(reviews).toHaveLength(13);
                    reviews.forEach((review) => {
                        expect(review).toEqual(
                            expect.objectContaining({
                                title: expect.any(String),
                                review_id: expect.any(Number),
                                category: expect.any(String),
                                review_img_url: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                designer: expect.any(String),
                                comment_count: expect.any(String),
                                owner: expect.any(String),
                            })
                        );
                    });
                    expect(reviews).toBeSortedBy("created_at", { descending: true, coerce: true, });
                });
        });

        test('invalid order_by', () => {
            return request(app)
                .get('/api/reviews?order=babaganush')
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe(`cannot order by babaganush`));
        });
    })

    describe("compound query", () => {
        test('queries: filter by category, sort by comment count, ascending', () => {
            return request(app)
                .get('/api/reviews?category=social deduction&sort_by=comment_count&order=asc')
                .expect(200)
                .then(({ body }) => {
                    const reviews = body.reviews;
                    expect(reviews).toHaveLength(11);
                    reviews.forEach((review) => {
                        expect(review).toEqual(
                            expect.objectContaining({
                                title: expect.any(String),
                                review_id: expect.any(Number),
                                category: expect.any(String),
                                review_img_url: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                designer: expect.any(String),
                                comment_count: expect.any(String),
                                owner: expect.any(String),
                            })
                        );
                    });
                    expect(reviews).toBeSortedBy("comment_count");
                });

        });
    })
})

describe('10. DELETE /api/comments/:comment_id', () => {
    test('valid comment id exists', () => {
        return request(app).delete('/api/comments/1').expect(204);
    });
    test('invalid comment id', () => {
        return request(app).delete('/api/comments/hello').expect(400).then(({ body }) => expect(body.msg).toBe("invalid data type"));
    });
    test("valid comment id, comment doesn't exist in relation", () => {
        return request(app).delete('/api/comments/100').expect(404).then(({ body }) => expect(body.msg).toBe("comment not found"));
    });
});

describe('11. GET /api', () => {
    test('sends back expected JSON object', () => {
        return request(app).get('/api').expect(200)
            .then(({ body }) => expect(body.endpoints).toEqual(endpoints))
    });
});