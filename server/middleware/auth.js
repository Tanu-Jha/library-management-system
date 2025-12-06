import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'library-management-secret-key-2024';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      username: user.username, 
      isAdmin: user.is_admin === 1,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export { JWT_SECRET };