const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());

app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

module.exports = app;
