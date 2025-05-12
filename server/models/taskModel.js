const { Schema, model } = require('mongoose');
const {
  TITLE_REQUIRED,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  CATEGORY_REQUIRED,
  PRIORITY_REQUIRED,
  STATUS_REQUIRED,
  DUE_DATE_REQUIRED,
  SELF_SHARE_ERROR,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES
} = require('../utils/errorMessages');

// Constants
const COLLECTION_NAME = 'Tasks';

const TaskSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference required'],
    index: true
  },
  title: {
    type: String,
    required: [true, TITLE_REQUIRED],
    trim: true,
    maxlength: [100, TITLE_MAX_LENGTH]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, DESCRIPTION_MAX_LENGTH],
    default: ''
  },
  category: {
    type: String,
    required: [true, CATEGORY_REQUIRED],
    enum: {
      values: TASK_CATEGORIES,
      message: `Category must be one of: ${TASK_CATEGORIES.join(', ')}`
    }
  },
  priority: {
    type: String,
    required: [true, PRIORITY_REQUIRED],
    enum: TASK_PRIORITIES,
    default: 'medium'
  },
  status: {
    type: String,
    required: [true, STATUS_REQUIRED],
    enum: TASK_STATUSES,
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, DUE_DATE_REQUIRED],
    index: true
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: v => !this.userId || !v.equals(this.userId),
      message: SELF_SHARE_ERROR
    }
  }]
}, {
  collection: COLLECTION_NAME,
  timestamps: true,
  indexes: [
    { userId: 1, status: 1 },
    { sharedWith: 1, status: 1 },
    { category: 1 }
  ],
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = model('Task', TaskSchema);