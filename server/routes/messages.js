import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDb, saveDatabase } from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM messages ORDER BY created_at DESC');
    
    if (result.length === 0) {
      return res.json([]);
    }
    
    const columns = result[0].columns;
    const messages = result[0].values.map(row => {
      const msg = {};
      columns.forEach((col, i) => {
        msg[col] = row[i];
      });
      return msg;
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/',
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).escape(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const db = getDb();
      const { name, email, message } = req.body;

      db.run('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    
      const lastId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
      saveDatabase();
    
      res.status(201).json({ id: lastId, message: 'Message sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

router.put('/:id', auth, (req, res) => {
  try {
    const db = getDb();
    const { read_status } = req.body;
    db.run('UPDATE messages SET read_status = ? WHERE id = ?', [read_status ? 1 : 0, req.params.id]);
    saveDatabase();
    res.json({ message: 'Message updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

router.delete('/:id', auth, (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;