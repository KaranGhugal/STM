// server/middleware/clientInfo.js
const getClientInfo = (req, res, next) => {
    req.clientInfo = {
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
    };
    next();
  };
  
  module.exports = { getClientInfo };