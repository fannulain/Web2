const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middlewares/auth');

const clients = new Map();
let wss;

const init = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(4001, 'Unauthorized: No token provided');
            return;
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            const userId = decoded.userId;

            clients.set(userId, ws);
            console.log(`[WebSocket] User ${userId} connected`);

            ws.on('close', () => {
                clients.delete(userId);
                console.log(`[WebSocket] User ${userId} disconnected`);
            });

            ws.on('error', (err) => {
                console.error(`[WebSocket] Error for user ${userId}:`, err);
                clients.delete(userId);
            });
        } catch (err) {
            ws.close(4003, 'Unauthorized: Invalid token');
        }
    });

    console.log('[WebSocket] Server initialized');
};

const notifyUser = (userId, data) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    } else {
        console.log(`[WebSocket] Cannot send to ${userId}, user is offline.`);
    }
};

module.exports = {
    init,
    notifyUser
};
