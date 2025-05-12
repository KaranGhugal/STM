const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: "N/A",
    },
    userAgent: {
      type: String,
      default: "N/A",
    },
  },
  { collection: "Login_Histories",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } }
);

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);

module.exports = LoginHistory;