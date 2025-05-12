const mongoose = require("mongoose");

const verifyEnvironment = (req, res, next) => {
  const requiredEnvVars = ["JWT_SECRET", "MONGO_URI"];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("Missing environment variables:", missingVars);
    return res.status(500).json({
      error: "Server configuration incomplete",
      missingVariables: missingVars,
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database connection not established",
    });
  }

  next();
};

module.exports = verifyEnvironment;
