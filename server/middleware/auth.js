const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from standard Authorization header
  const authHeader = req.header("Authorization");
  const token = authHeader?.replace("Bearer ", ""); 

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.role) {
      throw new Error("Invalid token payload: missing id or role");
    }
    req.user = { _id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};