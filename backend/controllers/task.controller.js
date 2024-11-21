const Task = require('../models/Task')

exports.getAllTasks = async (req, res) => {
  try {
    let tasks
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('created_by', 'email')
    } else {
      tasks = await Task.find({ created_by: req.user.id }).populate(
        'created_by',
        'email',
      )
    }

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, created_by: req.user.id })

    res.status(201).json({
      status: 'success',
      data: { task },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      created_by: req.user.id,
    }).populate('created_by', 'email')

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found',
      })
    }

    res.status(200).json({
      status: 'success',
      data: { task },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, created_by: req.user.id }

    const task = await Task.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    })

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found',
      })
    }

    res.status(200).json({ status: 'success', data: { task } })
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, created_by: req.user.id }

    const task = await Task.findOneAndDelete(query)

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found',
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}
