import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, saveDatabase } from './config/database.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import profileRoutes from './routes/profile.js';
import messageRoutes from './routes/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Startup checks ---
const UNSAFE_SECRETS = ['your-super-secret-jwt-key-change-in-production', 'secret', 'changeme', ''];
if (!process.env.JWT_SECRET || UNSAFE_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error('⚠️  WARNING: JWT_SECRET is not set or is using an unsafe default. Set a strong secret in .env before deploying to production.');
}

const app = express();

// --- CORS: only allow the configured client origin ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Rate limiting ---
// Strict limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later' }
});

// General limiter for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/profile', apiLimiter, profileRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Global error handling middleware ---
app.use((err, req, res, next) => {
  // Handle multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  // Handle multer file type errors
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

initDatabase().then(() => {
  // --- Periodic database auto-save (every 60 seconds) ---
  const AUTO_SAVE_INTERVAL = 60 * 1000;
  setInterval(() => {
    try {
      saveDatabase();
    } catch (e) {
      console.error('Auto-save failed:', e.message);
    }
  }, AUTO_SAVE_INTERVAL);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});