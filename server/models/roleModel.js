const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RoleType = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm Password is required'],
    minlength: [8, 'Confirm Password must be at least 8 characters'],
    select: false,
    validate: {
      validator: function(value) {
        return value === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  role: {
    type: String,
    enum: Object.values(RoleType),
    default: RoleType.USER
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
roleSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Clear confirmPassword after hashing password
    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
roleSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Exclude password and confirmPassword from JSON output
roleSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.confirmPassword;
    return ret;
  }
});

module.exports = mongoose.model('Role', roleSchema);
module.exports.RoleType = RoleType;