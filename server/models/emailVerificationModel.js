const { Schema, model } = require('mongoose');

const emailVerificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference required'],
    index: true
  },
  token: {
    type: String,
    required: [true, 'Verification token required'],
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date required'],
    index: { expires: '0s' } // Auto-delete after expiration
  }
}, {
  collection: 'Email_Verifications',
  timestamps: true
});

module.exports = model('EmailVerification', emailVerificationSchema);