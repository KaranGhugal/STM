const jwt = require('jsonwebtoken');

const generateToken = (res, userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable not defined');
  }
  
  if (!userId) {
    throw new Error('User ID is required for token generation');
  }

  if (!role) {
    throw new Error('Role is required for token generation');
  }

  const payload = { id: userId.toString(), role }; // Ensure userId is a string
  console.log('Generating token with payload:', payload);

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Verify the token immediately after generation
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Generated token verified successfully:', decoded);
  } catch (err) {
    console.error('Generated token is invalid:', err.message);
    throw new Error('Failed to generate a valid token');
  }

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    path: '/',
    domain: process.env.COOKIE_DOMAIN || 'localhost'
  });

  return token;
};

module.exports = generateToken;