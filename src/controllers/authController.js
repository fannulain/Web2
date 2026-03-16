const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middlewares/auth');

function loginUser(req, res) {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    const token = jwt.sign({ userId: username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
}

module.exports = { loginUser };
