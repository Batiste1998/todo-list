const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const routes = require('./routes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err))

// Routes
app.use('/api', routes)

// Error handling middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
