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
                expect(categories).toBeInstanceOf(Array);
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
