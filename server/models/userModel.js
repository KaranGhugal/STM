const { Schema, model } = require('mongoose');
const { genSalt, hash, compare } = require('bcryptjs');
const {
  NAME_REQUIRED,
  EMAIL_REQUIRED,
  INVALID_EMAIL,
  PHONE_REQUIRED,
  INVALID_PHONE,
  PASSWORD_REQUIRED,
  PASSWORD_LENGTH,
  PASSWORDS_DO_NOT_MATCH,
  HASHING_ERROR
} = require('../utils/errorMessages');

// Constants
const COLLECTION_NAME = 'Registered_Users';
const SALT_ROUNDS = 10;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, NAME_REQUIRED],
    trim: true,
  },
  email: {
    type: String,
    required: [true, EMAIL_REQUIRED],
    unique: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, INVALID_EMAIL],
    index: true
  },
  phone: {
    type: String,
    required: [true, PHONE_REQUIRED],
    validate: {
      validator: v => /^\+?[1-9]\d{1,14}$/.test(v),
      message: INVALID_PHONE
    }
  },
  password: {
    type: String,
    required: [true, PASSWORD_REQUIRED],
    minlength: [8, PASSWORD_LENGTH],
    select: false
  },
  confirmPassword: {
    type: String,
    required: function() { return this.isNew || this.isModified('password') },
    validate: {
      validator: function(v) { return v === this.password },
      message: PASSWORDS_DO_NOT_MATCH
    }
  },
  photo: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: -1
  }
}, {
  collection: COLLECTION_NAME,
  timestamps: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.confirmPassword;
      return ret;
    }
  }
});

// Password verification method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return enteredPassword && this.password 
    ? compare(enteredPassword, this.password)
    : false;
};

// Pre-save password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await genSalt(SALT_ROUNDS);
    this.password = await hash(this.password, salt);
    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(new Error(`${HASHING_ERROR}: ${error.message}`));
  }
});

module.exports = model('User', userSchema);