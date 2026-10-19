import { Router } from 'express';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/backup/export
router.get('/export', async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (db.isPostgres) {
      const stateResult = await db.query('SELECT state FROM public.ms_state WHERE user_id = $1', [userId]);
      const tasksResult = await db.query('SELECT * FROM public.tasks WHERE user_id = $1', [userId]);
      const projectsResult = await db.query('SELECT * FROM public.projects WHERE user_id = $1', [userId]);
      const filesResult = await db.query('SELECT * FROM public.files WHERE user_id = $1', [userId]);

      const backup = {
        version: 1,
        exported_at: new Date().toISOString(),
        state: stateResult.rows[0]?.state || {},
        tasks: tasksResult.rows,
        projects: projectsResult.rows,
        files: filesResult.rows
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=organizaya-backup-${new Date().toISOString().slice(0, 10)}.json`);
      return res.json(backup);
    } else {
      const stateEntry = db.localDb.states[userId] || { state: {} };
      const backup = {
        version: 1,
        exported_at: new Date().toISOString(),
        state: stateEntry.state
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=organizaya-backup-${new Date().toISOString().slice(0, 10)}.json`);
      return res.json(backup);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/backup/import
router.post('/import', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { state, backup } = req.body;

    const targetState = state || backup?.state || backup?.S;
    if (!targetState) {
      return res.status(400).json({ error: 'Formato de copia de seguridad no válido' });
    }

    const now = new Date().toISOString();

    if (db.isPostgres) {
      await db.query(
        `INSERT INTO public.ms_state (user_id, state, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET state = $2, updated_at = $3`,
        [userId, JSON.stringify(targetState), now]
      );
    } else {
      db.localDb.states[userId] = {
        state: targetState,
        updated_at: now
      };
      db.syncLocalDb();
    }

    res.json({
      success: true,
      message: 'Copia de seguridad restaurada exitosamente'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
