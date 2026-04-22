import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getDb, saveDatabase } from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Registration is protected: only allow if no users exist yet (first-time setup)
// or if an existing admin is authenticated
router.post('/register',
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  validate,
  (req, res) => {
    try {
      const db = getDb();
      const { email, password, name } = req.body;

      // Only allow registration if no users exist (first admin setup)
      // To add more admins later, use the authenticated PUT /me endpoint
      const userCount = db.exec('SELECT COUNT(*) FROM users');
      const count = userCount[0]?.values[0]?.[0] || 0;

      if (count > 0) {
        // Check if the request is from an authenticated admin
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(403).json({ error: 'Registration is disabled. An admin account already exists.' });
        }
        try {
          jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        } catch {
          return res.status(403).json({ error: 'Registration is disabled. An admin account already exists.' });
        }
      }

      const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0 && existing[0].values.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = bcrypt.hashSync(password, 12);
      db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name || 'Admin']);

      const lastId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
      saveDatabase();

      const token = jwt.sign({ userId: lastId }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: lastId, email, name } });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post('/login',
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  (req, res) => {
    try {
      const db = getDb();
      const { email, password } = req.body;

      const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
      if (result.length === 0 || result[0].values.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = {
        id: result[0].values[0][0],
        email: result[0].values[0][1],
        password: result[0].values[0][2],
        name: result[0].values[0][3],
        avatar: result[0].values[0][4]
      };

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/me', auth, (req, res) => {
  try {
    const db = getDb();
    const { name, avatar } = req.body;
    db.run('UPDATE users SET name = ?, avatar = ? WHERE id = ?', [name, avatar, req.user.id]);
    saveDatabase();
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;