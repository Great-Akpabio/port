import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';

const auth = (req, res, next) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = db.exec('SELECT id, email, name, avatar FROM users WHERE id = ?', [decoded.userId]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = {
      id: result[0].values[0][0],
      email: result[0].values[0][1],
      name: result[0].values[0][2],
      avatar: result[0].values[0][3]
    };

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

export default auth;