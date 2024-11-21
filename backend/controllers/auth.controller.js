const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Generate JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists with this email',
      })
    }

    // Create new user
    const user = await User.create({ email, password })

    // Generate JWT token
    const token = createToken(user._id)

    return res.status(201).json({
      status: 'success',
      token,
      message: 'User registered successfully',
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if email & password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      })
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      })
    }

    // Generate JWT token
    const token = createToken(user._id)

    // Remove password from response
    user.password = undefined

    res.status(200).json({
      status: 'success',
      token,
      message: 'User logged in successfully',
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}
