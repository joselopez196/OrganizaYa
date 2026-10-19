import { Router } from 'express';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/sync - Descargar estado en la nube
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (db.isPostgres) {
      const result = await db.query(
        'SELECT state, updated_at FROM public.ms_state WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.json({ exists: false, state: null });
      }

      return res.json({
        exists: true,
        state: result.rows[0].state,
        updated_at: result.rows[0].updated_at
      });
    } else {
      const entry = db.localDb.states[userId];
      if (!entry) {
        return res.json({ exists: false, state: null });
      }

      return res.json({
        exists: true,
        state: entry.state,
        updated_at: entry.updated_at
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/sync - Guardar o fusionar estado
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { state } = req.body;

    if (!state || typeof state !== 'object') {
      return res.status(400).json({ error: 'El estado debe ser un objeto JSON válido' });
    }

    // Aseguramos timestamp
    const now = new Date().toISOString();
    const clientAt = Number(state.at) || Date.now();
    state.at = clientAt;

    if (db.isPostgres) {
      // Upsert
      await db.query(
        `INSERT INTO public.ms_state (user_id, state, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET state = $2, updated_at = $3`,
        [userId, JSON.stringify(state), now]
      );
    } else {
      db.localDb.states[userId] = {
        state,
        updated_at: now
      };
      db.syncLocalDb();
    }

    res.json({
      success: true,
      message: 'Estado sincronizado correctamente',
      at: state.at,
      updated_at: now
    });
  } catch (err) {
    next(err);
  }
});

export default router;
