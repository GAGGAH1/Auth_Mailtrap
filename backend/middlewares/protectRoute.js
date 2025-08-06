const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    req.userId = decoded.userId; // Attach user info to request object
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}


module.exports = protectRoute;