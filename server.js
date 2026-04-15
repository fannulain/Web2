const app = require('./src/app');
const { connectRabbitMQ, consumeEvents } = require('./src/services/rabbitmqService');
const { initMinio } = require('./src/services/minioService');

const websocketService = require('./src/services/websocketService');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data Storage: tasks.db`);
    await initMinio();
    await connectRabbitMQ();
    await consumeEvents();
});

websocketService.init(server);
