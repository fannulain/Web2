const express = require('express');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

module.exports = app;
