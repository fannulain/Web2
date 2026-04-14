const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app'); // Express App
const { SECRET_KEY } = require('../../src/middlewares/auth');

describe('Auth Middleware Integration Tests', () => {

    describe('GET /tasks', () => {
        it('should return 401 when authorization header is missing', async () => {
            const response = await request(app).get('/tasks');
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Access denied. No token provided.');
        });

        it('should return 403 when token is invalid', async () => {
            const response = await request(app)
                .get('/tasks')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Invalid token.');
        });

        it('should proceed to route if token is valid', async () => {
            const mockToken = jwt.sign({ userId: 'test-user-123' }, SECRET_KEY, { expiresIn: '1h' });

            const response = await request(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).not.toBe(401);
            expect(response.status).not.toBe(403);
        });
    });
});
