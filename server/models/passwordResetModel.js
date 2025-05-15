const { Schema, model } = require('mongoose');

const passwordResetSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference required'],
    index: true
  },
  token: {
    type: String,
    required: [true, 'Reset token required'],
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date required'],
    index: { expires: '0s' } // Auto-delete after expiration
  }
}, {
  collection: 'Password_Resets',
  timestamps: true
});

module.exports = model('PasswordReset', passwordResetSchema);