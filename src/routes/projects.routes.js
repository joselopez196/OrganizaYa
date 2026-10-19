import { Router } from 'express';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { archived } = req.query;

    if (db.isPostgres) {
      let q = 'SELECT * FROM public.projects WHERE user_id = $1';
      const params = [userId];

      if (archived !== undefined) {
        params.push(archived === 'true');
        q += ` AND is_archived = $${params.length}`;
      }

      q += ' ORDER BY created_at DESC';
      const result = await db.query(q, params);
      return res.json({ projects: result.rows });
    } else {
      const state = (db.localDb.states[userId] || {}).state || { projects: [] };
      let list = state.projects || [];
      if (archived !== undefined) {
        list = list.filter(p => !!p.arch === (archived === 'true'));
      }
      return res.json({ projects: list });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, color, due, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
    }

    const projectId = 'prj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    if (db.isPostgres) {
      const result = await db.query(
        `INSERT INTO public.projects (id, user_id, name, color, due, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, userId, name.trim(), color || '#5b3df5', due || null, status || 'activo']
      );
      res.status(201).json({ project: result.rows[0] });
    } else {
      const state = (db.localDb.states[userId] = db.localDb.states[userId] || { state: { projects: [] } });
      const newProject = {
        id: projectId,
        name: name.trim(),
        color: color || '#5b3df5',
        due: due || '',
        st: status || 'activo',
        arch: false,
        u: Date.now()
      };
      state.state.projects = state.state.projects || [];
      state.state.projects.push(newProject);
      db.syncLocalDb();
      res.status(201).json({ project: newProject });
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, color, due, status, is_archived } = req.body;

    if (db.isPostgres) {
      const result = await db.query(
        `UPDATE public.projects
         SET name = COALESCE($1, name),
             color = COALESCE($2, color),
             due = COALESCE($3, due),
             status = COALESCE($4, status),
             is_archived = COALESCE($5, is_archived)
         WHERE id = $6 AND user_id = $7
         RETURNING *`,
        [name, color, due, status, is_archived, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      res.json({ project: result.rows[0] });
    } else {
      const state = (db.localDb.states[userId] = db.localDb.states[userId] || { state: { projects: [] } });
      const project = (state.state.projects || []).find(p => p.id === id);
      if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

      if (name !== undefined) project.name = name;
      if (color !== undefined) project.color = color;
      if (due !== undefined) project.due = due;
      if (status !== undefined) project.st = status;
      if (is_archived !== undefined) project.arch = is_archived;
      project.u = Date.now();

      db.syncLocalDb();
      res.json({ project });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (db.isPostgres) {
      const result = await db.query('DELETE FROM public.projects WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      res.json({ success: true, message: 'Proyecto eliminado' });
    } else {
      const state = (db.localDb.states[userId] = db.localDb.states[userId] || { state: { projects: [] } });
      state.state.projects = (state.state.projects || []).filter(p => p.id !== id);
      db.syncLocalDb();
      res.json({ success: true, message: 'Proyecto eliminado' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
