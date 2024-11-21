const express = require('express')
const router = express.Router()
const taskController = require('../controllers/task.controller')
const { protect, restrictTo } = require('../middleware/auth')

router.use(protect)

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask)

router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(restrictTo('admin'), taskController.deleteTask)

module.exports = router
