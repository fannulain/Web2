jest.mock('jsonwebtoken');
const { loginUser } = require('../../src/controllers/authController');
const jwt = require('jsonwebtoken');

describe('Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('400, if no username', () => {
        loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
    });

    test('token, if username good', () => {
        req.body.username = 'Віталій';
        jwt.sign.mockReturnValue('fake-jwt-token');

        loginUser(req, res);

        expect(jwt.sign).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
    });
});
