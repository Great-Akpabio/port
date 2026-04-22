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
    
    const result = db.exec('SELECT * FROM projects ORDER BY created_at DESC');
    if (result.length === 0) {
      return res.json([]);
    }
    
    const columns = result[0].columns;
    const projects = result[0].values.map(row => {
      const project = {};
      columns.forEach((col, i) => {
        project[col] = row[i];
      });
      project.tech_stack = project.tech_stack ? JSON.parse(project.tech_stack) : [];
      return project;
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const columns = result[0].columns;
    const project = {};
    columns.forEach((col, i) => {
      project[col] = result[0].values[0][i];
    });
    project.tech_stack = project.tech_stack ? JSON.parse(project.tech_stack) : [];
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    const db = getDb();
    const { title, description, live_url, github_url, tech_stack } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.run('INSERT INTO projects (title, description, image, live_url, github_url, tech_stack) VALUES (?, ?, ?, ?, ?, ?)', [
      title, description, image, live_url, github_url, JSON.stringify(tech_stack ? JSON.parse(tech_stack) : [])
    ]);
    
    const lastId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    saveDatabase();
    
    res.status(201).json({ id: lastId, message: 'Project created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', auth, upload.single('image'), (req, res) => {
  try {
    const db = getDb();
    const { title, description, live_url, github_url, tech_stack } = req.body;
    let image = req.body.image;
    
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    db.run('UPDATE projects SET title = ?, description = ?, image = ?, live_url = ?, github_url = ?, tech_stack = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      title, description, image, live_url, github_url, JSON.stringify(tech_stack ? JSON.parse(tech_stack) : []), req.params.id
    ]);
    
    saveDatabase();
    res.json({ message: 'Project updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', auth, (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;