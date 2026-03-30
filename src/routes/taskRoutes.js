const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const {
    createNewTask,
    getTask,
    getTasks,
    updateTask,
    removeTask
} = require('../controllers/taskController');

const router = express.Router();

// Захищаєм всі маршрути тасками
router.use(authenticateToken);

router.post('/', createNewTask);
router.get('/:id', getTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', removeTask);

module.exports = router;
