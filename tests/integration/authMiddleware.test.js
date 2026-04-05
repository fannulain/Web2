const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../src/middlewares/auth');
jest.mock('../../src/models/db', () => ({
    getAllTasks: jest.fn().mockReturnValue([])
}));
jest.mock('../../src/services/rabbitmqService', () => ({
    publishTask: jest.fn()
}));
jest.mock('../../src/services/minioService', () => ({
    getObjectData: jest.fn()
}));
describe('Integration Tests (Security)', () => {

    test('401 (Unauthorized), if no token', async () => {
        const response = await request(app).get('/tasks');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Access denied. No token provided.' });
    });

    test('403 (Forbidden), if fake token', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', 'Bearer invalid_and_wrong_token_123');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'Invalid token.' });
    });

    test('200, if good token', async () => {
        const validToken = jwt.sign({ userId: 'test-user' }, SECRET_KEY);
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${validToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

});
