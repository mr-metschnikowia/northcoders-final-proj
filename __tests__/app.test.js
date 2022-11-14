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

describe('1. GET /api/reviews', () => {
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
                const dates = reviews.map(review => review.created_at);
                const orderedDates = [...dates];
                orderedDates.sort((a, b) => { return new Date(b) - new Date(a) });
                expect(dates).toEqual(orderedDates);
            });
    });
});