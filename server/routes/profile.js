import express from 'express';
import { getDb, saveDatabase } from '../config/database.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const result = db.exec('SELECT * FROM profile WHERE id = 1');
    if (result.length === 0 || result[0].values.length === 0) {
      return res.json({ bio: '', email: '', phone: '', location: '', social_links: {}, skills: [] });
    }
    
    const columns = result[0].columns;
    const profile = {};
    columns.forEach((col, i) => {
      profile[col] = result[0].values[0][i];
    });
    profile.social_links = profile.social_links ? JSON.parse(profile.social_links) : {};
    profile.skills = profile.skills ? JSON.parse(profile.skills) : [];
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/', auth, (req, res) => {
  try {
    const db = getDb();
    const { bio, email, phone, location, social_links, skills, avatar } = req.body;
    
    const existing = db.exec('SELECT id FROM profile WHERE id = 1');
    if (existing.length > 0 && existing[0].values.length > 0) {
      if (avatar) {
        db.run('UPDATE profile SET bio = ?, email = ?, phone = ?, location = ?, social_links = ?, skills = ?, avatar = ? WHERE id = 1', [
          bio, email, phone, location, JSON.stringify(social_links || {}), JSON.stringify(skills || []), avatar
        ]);
      } else {
        db.run('UPDATE profile SET bio = ?, email = ?, phone = ?, location = ?, social_links = ?, skills = ? WHERE id = 1', [
          bio, email, phone, location, JSON.stringify(social_links || {}), JSON.stringify(skills || [])
        ]);
      }
    } else {
      db.run('INSERT INTO profile (id, bio, email, phone, location, social_links, skills, avatar) VALUES (1, ?, ?, ?, ?, ?, ?, ?)', [
        bio, email, phone, location, JSON.stringify(social_links || {}), JSON.stringify(skills || []), avatar || null
      ]);
    }
    
    saveDatabase();
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;