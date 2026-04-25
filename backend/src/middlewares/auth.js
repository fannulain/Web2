const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.userId = decoded.userId;
        next();
    });
}

module.exports = { authenticateToken, SECRET_KEY };
