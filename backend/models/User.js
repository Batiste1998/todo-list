const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      validate: function (password) {
        return validator.isStrongPassword(password, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      },
      message:
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    next(error)
  }
})

// Compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
