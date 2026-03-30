const app = require('./src/app');
const { connectRabbitMQ, consumeEvents } = require('./src/services/rabbitmqService');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data Storage: tasks.db`);
    await connectRabbitMQ();
    await consumeEvents();
});
