import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { badRequest } from '../lib/errors.js';
import { getGameState, previewQuery, recordAttempt, recordCheck, recordHint } from '../services/game.js';
import { querySpecSchema } from '../services/missions.js';
import { ensureLabSeeded, getLabToys, resetLab } from '../services/lab.js';
import { tableSnapshot } from '../engine/queryEngine.js';

const lessonParams = z.object({ id: z.string().min(1).max(60) }).strict();
const tableParams = z.object({ name: z.string().min(1).max(40) }).strict();

const attemptBody = z
  .object({
    step: z.enum(['mission', 'practice']),
    answer: z.unknown(),
  })
  .strict();

const checkBody = z
  .object({
    index: z.number().int().min(0).max(2),
    optionId: z.string().min(1).max(40),
  })
  .strict();

const hintBody = z.object({ index: z.number().int().min(0).max(2) }).strict();
const previewBody = z.object({ query: querySpecSchema }).strict();

export const gameRouter = Router();

gameRouter.use(requireAuth);

gameRouter.get('/state', async (req, res, next) => {
  try {
    res.json(await getGameState(req.user!.id));
  } catch (error) {
    next(error);
  }
});

gameRouter.get('/tables/:name', (req, res, next) => {
  try {
    const { name } = tableParams.parse(req.params);
    res.json(tableSnapshot(name));
  } catch (error) {
    next(error);
  }
});

gameRouter.post('/lessons/:id/attempts', async (req, res, next) => {
  try {
    const { id } = lessonParams.parse(req.params);
    const body = attemptBody.parse(req.body);
    const result = await recordAttempt({
      userId: req.user!.id,
      lessonId: id,
      step: body.step,
      answer: body.answer,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

gameRouter.post('/lessons/:id/checks', async (req, res, next) => {
  try {
    const { id } = lessonParams.parse(req.params);
    const body = checkBody.parse(req.body);
    const result = await recordCheck({
      userId: req.user!.id,
      lessonId: id,
      index: body.index,
      optionId: body.optionId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

gameRouter.post('/lessons/:id/hints', async (req, res, next) => {
  try {
    const { id } = lessonParams.parse(req.params);
    const body = hintBody.parse(req.body);
    if (body.index > 2) throw badRequest('Esa pista no existe.');
    res.json(await recordHint(req.user!.id, id));
  } catch (error) {
    next(error);
  }
});

gameRouter.post('/query/preview', async (req, res, next) => {
  try {
    const body = previewBody.parse(req.body);
    res.json(await previewQuery(body.query));
  } catch (error) {
    next(error);
  }
});

gameRouter.get('/lab', async (req, res, next) => {
  try {
    res.json({ toys: await ensureLabSeeded(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

gameRouter.post('/lab/reset', async (req, res, next) => {
  try {
    res.json({ toys: await resetLab(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

gameRouter.get('/lab/state', async (req, res, next) => {
  try {
    res.json({ toys: await getLabToys(req.user!.id) });
  } catch (error) {
    next(error);
  }
});
