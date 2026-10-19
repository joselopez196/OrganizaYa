import { Router } from 'express';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId, done, due } = req.query;

    if (db.isPostgres) {
      let q = 'SELECT * FROM public.tasks WHERE user_id = $1';
      const params = [userId];

      if (projectId) {
        params.push(projectId);
        q += ` AND project_id = $${params.length}`;
      }
      if (done !== undefined) {
        params.push(done === 'true');
        q += ` AND done = $${params.length}`;
      }
      if (due) {
        params.push(due);
        q += ` AND due = $${params.length}`;
      }

      q += ' ORDER BY due ASC NULLS LAST, priority DESC';
      const result = await db.query(q, params);
      return res.json({ tasks: result.rows });
    } else {
      const state = (db.localDb.states[userId] || {}).state || { tasks: [] };
      let list = state.tasks || [];

      if (projectId) list = list.filter(t => t.p === projectId);
      if (done !== undefined) list = list.filter(t => t.done === (done === 'true'));
      if (due) list = list.filter(t => t.due === due);

      return res.json({ tasks: list });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, due, due_time, priority, project_id, note, recurrence, subtasks } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El título de la tarea es obligatorio' });
    }

    const taskId = 'tsk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    if (db.isPostgres) {
      const result = await db.query(
        `INSERT INTO public.tasks (id, user_id, title, due, due_time, priority, project_id, note, recurrence, subtasks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          taskId,
          userId,
          title.trim(),
          due || null,
          due_time || null,
          priority || 0,
          project_id || null,
          note || '',
          recurrence || null,
          JSON.stringify(subtasks || [])
        ]
      );
      res.status(201).json({ task: result.rows[0] });
    } else {
      const state = (db.localDb.states[userId] = db.localDb.states[userId] || { state: { tasks: [] } });
      const newTask = {
        id: taskId,
        title: title.trim(),
        p: project_id || '',
        due: due || '',
        time: due_time || '',
        pri: priority || 0,
        note: note || '',
        rep: recurrence || '',
        done: false,
        doneAt: '',
        subs: subtasks || [],
        u: Date.now()
      };
      state.state.tasks.push(newTask);
      db.syncLocalDb();
      res.status(201).json({ task: newTask });
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, due, due_time, priority, project_id, note, recurrence, done, subtasks } = req.body;

    if (db.isPostgres) {
      const result = await db.query(
        `UPDATE public.tasks
         SET title = COALESCE($1, title),
             due = COALESCE($2, due),
             due_time = COALESCE($3, due_time),
             priority = COALESCE($4, priority),
             project_id = COALESCE($5, project_id),
             note = COALESCE($6, note),
             recurrence = COALESCE($7, recurrence),
             done = COALESCE($8, done),
             subtasks = COALESCE($9, subtasks)
         WHERE id = $10 AND user_id = $11
         RETURNING *`,
        [title, due, due_time, priority, project_id, note, recurrence, done, subtasks ? JSON.stringify(subtasks) : null, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ task: result.rows[0] });
    } else {
      const state = (db.localDb.states[userId] = db.localDb.states[userId] || { state: { tasks: [] } });
      const task = (state.state.tasks || []).find(t => t.id === id);
      if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

      if (title !== undefined) task.title = title;
      if (due !== undefined) task.due = due;
      if (due_time !== undefined) task.time = due_time;
      if (priority !== undefined) task.pri = priority;
      if (project_id !== undefined) task.p = project_id;
      if (note !== undefined) task.note = note;
      if (recurrence !== undefined) task.rep = recurrence;
      if (done !== undefined) {
        task.done = done;
        task.doneAt = done ? new Date().toISOString().slice(0, 10) : '';
      }
      if (subtasks !== undefined) task.subs = subtasks;
      task.u = Date.now();

      db.syncLocalDb();
      res.json({ task });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (db.isPostgres) {
      const result = await db.query('DELETE FROM public.tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ success: true, message: 'Tarea eliminada' });
    } else {
      const state = (db.localDb.states[userId] = db.localDb.states[userId] || { state: { tasks: [] } });
      state.state.tasks = (state.state.tasks || []).filter(t => t.id !== id);
      db.syncLocalDb();
      res.json({ success: true, message: 'Tarea eliminada' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
