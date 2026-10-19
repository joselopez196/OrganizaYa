import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'organizaya_dev_secret_key_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (db.isPostgres) {
      const existing = await db.query('SELECT id FROM public.users WHERE email = $1', [normalizedEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        'INSERT INTO public.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [normalizedEmail, hashedPassword, name || '']
      );

      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.status(201).json({
        message: 'Cuenta creada exitosamente',
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } else {
      // Local DB
      const existing = db.localDb.users.find(u => u.email === normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        email: normalizedEmail,
        password_hash: hashedPassword,
        name: name || '',
        created_at: new Date().toISOString()
      };

      db.localDb.users.push(user);
      db.syncLocalDb();

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.status(201).json({
        message: 'Cuenta creada exitosamente',
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Escribe tu correo y contraseña' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = null;
    if (db.isPostgres) {
      const result = await db.query('SELECT * FROM public.users WHERE email = $1', [normalizedEmail]);
      user = result.rows[0];
    } else {
      user = db.localDb.users.find(u => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    let user = null;
    if (db.isPostgres) {
      const result = await db.query('SELECT id, email, name, created_at FROM public.users WHERE id = $1', [req.user.id]);
      user = result.rows[0];
    } else {
      user = db.localDb.users.find(u => u.id === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
