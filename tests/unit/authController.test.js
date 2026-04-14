const { loginUser } = require('../../src/controllers/authController');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Controller (Unit Tests)', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('loginUser', () => {
        it('should return 400 if username is missing', () => {
            loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
        });

        it('should generate a token and return it if username is provided', () => {
            req.body.username = 'testuser';
            jwt.sign.mockReturnValue('fakeJwtToken');

            loginUser(req, res);

            expect(jwt.sign).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ token: 'fakeJwtToken' });
        });
    });
});
