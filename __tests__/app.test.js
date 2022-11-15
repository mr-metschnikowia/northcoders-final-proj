const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const data = require('../db/data/test-data');
const seed = require('../db/seeds/seed');

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

describe('3. GET /api/reviews/:review_id/comments', () => {
    test('status:200, responds with array of comments associated with specific review_id', () => {
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
            });
    });
    test('valid id not found', () => {
        return request(app)
            .get(`/api/reviews/10/comments`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("valid id not found")
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