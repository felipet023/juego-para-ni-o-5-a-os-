import { beforeEach, describe, expect, it } from 'vitest';
import {
  app,
  correctAnswer,
  createUser,
  lessonById,
  loginAgent,
  resetDatabase,
  unlockLesson,
  LESSONS,
} from './helpers.js';

const PLAYER = { username: 'jugador', password: 'ClaveJugador1!' };

async function playerAgent() {
  const id = await createUser(PLAYER);
  const agent = await loginAgent(PLAYER.username, PLAYER.password);
  return { id, agent };
}

describe('Juego: progreso, desbloqueo y consultas', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('entrega el estado inicial sin revelar las respuestas correctas', async () => {
    const { agent } = await playerAgent();
    const response = await agent.get('/api/game/state').expect(200);

    expect(response.body.lessons).toHaveLength(13);
    expect(response.body.stats.total).toBe(13);
    expect(response.body.stats.stars).toBe(0);
    expect(response.body.lessons[0].status).toBe('available');
    expect(response.body.lessons[1].status).toBe('locked');

    expect(JSON.stringify(response.body)).not.toContain('correctId');
    expect(JSON.stringify(response.body)).not.toContain('"expected"');
    for (const lesson of response.body.lessons) {
      expect(lesson.mission.correctId).toBeUndefined();
      expect(lesson.mission.expected).toBeUndefined();
      expect(lesson.practice.correctId).toBeUndefined();
      expect(lesson.checks[0].correctId).toBeUndefined();
      expect(lesson.checks[0].explanation).toBeUndefined();
    }
  });

  it('no deja saltarse lecciones bloqueadas', async () => {
    const { agent } = await playerAgent();
    const locked = lessonById('select');
    await agent
      .post(`/api/game/lessons/${locked.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(locked.mission) })
      .expect(403);
  });

  it('no deja practicar antes de completar la misión', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');
    await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'practice', answer: correctAnswer(lesson.practice) })
      .expect(403);
  });

  it('no deja responder las preguntas sin misión y práctica', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');
    await agent
      .post(`/api/game/lessons/${lesson.id}/checks`)
      .send({ index: 0, optionId: 'a' })
      .expect(403);
  });

  it('da una estrella por la misión y dos por la práctica', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');

    const mission = await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(lesson.mission) })
      .expect(200);
    expect(mission.body.correct).toBe(true);
    expect(mission.body.stars).toBe(1);

    const practice = await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'practice', answer: correctAnswer(lesson.practice) })
      .expect(200);
    expect(practice.body.stars).toBe(2);
    expect(practice.body.mastered).toBe(false);
  });

  it('una respuesta incorrecta no da estrellas ni bloquea el reintento', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');

    const wrong = await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'mission', answer: { optionId: 'b' } })
      .expect(200);
    expect(wrong.body.correct).toBe(false);
    expect(wrong.body.stars).toBe(0);
    expect(wrong.body.feedback).toBe(lesson.errorFeedback);

    const right = await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(lesson.mission) })
      .expect(200);
    expect(right.body.correct).toBe(true);
  });

  it('domina la lección con las tres preguntas y desbloquea la siguiente', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');

    await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(lesson.mission) })
      .expect(200);
    await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'practice', answer: correctAnswer(lesson.practice) })
      .expect(200);

    for (const [index, check] of lesson.checks.entries()) {
      const result = await agent
        .post(`/api/game/lessons/${lesson.id}/checks`)
        .send({ index, optionId: check.correctId })
        .expect(200);
      expect(result.body.correct).toBe(true);
      if (index < 2) expect(result.body.mastered).toBe(false);
    }

    const state = await agent.get('/api/game/state').expect(200);
    expect(state.body.lessons[0].status).toBe('mastered');
    expect(state.body.lessons[0].stars).toBe(3);
    expect(state.body.lessons[1].status).toBe('available');
    expect(state.body.stats.mastered).toBe(1);
    expect(state.body.badges.map((badge: { key: string }) => badge.key)).toContain(
      lesson.badge.key,
    );
  });

  it('una pregunta incorrecta no marca la lección como dominada', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');
    await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(lesson.mission) })
      .expect(200);
    await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'practice', answer: correctAnswer(lesson.practice) })
      .expect(200);

    const wrongOption = lesson.checks[0].options.find(
      (option) => option.id !== lesson.checks[0].correctId,
    );
    const wrong = await agent
      .post(`/api/game/lessons/${lesson.id}/checks`)
      .send({ index: 0, optionId: wrongOption?.id })
      .expect(200);
    expect(wrong.body.correct).toBe(false);
    expect(wrong.body.mastered).toBe(false);
    expect(wrong.body.checksPassed).toBe(0);
  });

  it('limita las pistas a tres por lección', async () => {
    const { agent } = await playerAgent();
    const lesson = lessonById('hola-byte');

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await agent
        .post(`/api/game/lessons/${lesson.id}/hints`)
        .send({ index: 0 })
        .expect(200);
      expect(response.body.hintsUsed).toBe(Math.min(attempt, 3));
    }
  });

  it('evalúa un INNER JOIN y deja fuera las filas sin pareja', async () => {
    const { agent } = await playerAgent();
    const response = await agent
      .post('/api/game/query/preview')
      .send({
        query: {
          select: ['mascotas.nombre', 'duenos.nombre'],
          from: 'mascotas',
          join: { table: 'duenos', leftColumn: 'mascotas.id_dueno', rightColumn: 'duenos.id' },
        },
      })
      .expect(200);

    expect(response.body.result.rows).toHaveLength(4);
    const flat = JSON.stringify(response.body.result.rows);
    expect(flat).toContain('Michi');
    expect(flat).not.toContain('Tino');
    expect(response.body.result.sql).toContain('INNER JOIN');
  });

  it('rechaza intentos de inyección SQL en el constructor de consultas', async () => {
    const { agent } = await playerAgent();

    const response = await agent
      .post('/api/game/query/preview')
      .send({ query: { select: ['nombre; DROP TABLE users'], from: 'juguetes' } })
      .expect(400);
    expect(response.body.error.code).toBe('validation_error');

    // La tabla sigue existiendo y el juego funciona.
    await agent.get('/api/game/state').expect(200);
    const users = await agent.get('/api/game/tables/juguetes').expect(200);
    expect(users.body.rows.length).toBeGreaterThan(0);
  });

  it('rechaza tablas que no están en la lista blanca', async () => {
    const { agent } = await playerAgent();
    await agent
      .post('/api/game/query/preview')
      .send({ query: { select: ['*'], from: 'mysql.user' } })
      .expect(400);
  });

  it('rechaza propiedades extra en la consulta enviada', async () => {
    const { agent } = await playerAgent();
    await agent
      .post('/api/game/query/preview')
      .send({ query: { select: ['nombre'], from: 'juguetes', drop: true } })
      .expect(400);
  });

  it('muestra las tablas de práctica con datos ficticios', async () => {
    const { agent } = await playerAgent();
    const response = await agent.get('/api/game/tables/juguetes').expect(200);
    expect(response.body.columns.map((column: { key: string }) => column.key)).toContain('nombre');
    expect(response.body.rows.length).toBe(5);
  });

  it('ejecuta INSERT, UPDATE y DELETE solo en el laboratorio aislado', async () => {
    const { id, agent } = await playerAgent();
    await unlockLesson(id, 'insert');

    const insertLesson = lessonById('insert');
    const inserted = await agent
      .post(`/api/game/lessons/${insertLesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(insertLesson.mission) })
      .expect(200);
    expect(inserted.body.correct).toBe(true);
    expect(inserted.body.lab.map((toy: { nombre: string }) => toy.nombre)).toContain('Estrella');

    await unlockLesson(id, 'update-delete');
    const updateLesson = lessonById('update-delete');
    const updated = await agent
      .post(`/api/game/lessons/${updateLesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(updateLesson.mission) })
      .expect(200);
    expect(updated.body.correct).toBe(true);
    const robot = updated.body.lab.find((toy: { nombre: string }) => toy.nombre === 'Robot');
    expect(robot.color).toBe('morado');

    const deleted = await agent
      .post(`/api/game/lessons/${updateLesson.id}/attempts`)
      .send({ step: 'practice', answer: correctAnswer(updateLesson.practice) })
      .expect(200);
    expect(deleted.body.correct).toBe(true);
    expect(deleted.body.lab.map((toy: { nombre: string }) => toy.nombre)).not.toContain('Pelota');

    const reset = await agent.post('/api/game/lab/reset').expect(200);
    expect(reset.body.toys).toHaveLength(4);
  });

  it('mantiene el laboratorio separado por jugador', async () => {
    const first = await playerAgent();
    await unlockLesson(first.id, 'insert');
    const lesson = lessonById('insert');
    await first.agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({ step: 'mission', answer: correctAnswer(lesson.mission) })
      .expect(200);

    const second = await playerAgent();
    const secondLab = await second.agent.get('/api/game/lab').expect(200);
    expect(secondLab.body.toys).toHaveLength(4);
    expect(secondLab.body.toys.map((toy: { nombre: string }) => toy.nombre)).not.toContain(
      'Estrella',
    );
  });

  it('no ejecuta SQL aunque el nombre del juguete parezca una orden', async () => {
    const { id, agent } = await playerAgent();
    await unlockLesson(id, 'insert');
    const lesson = lessonById('insert');

    const attack = await agent
      .post(`/api/game/lessons/${lesson.id}/attempts`)
      .send({
        step: 'mission',
        answer: {
          nombre: "x'); DROP TABLE lab_juguetes; --",
          tipo: 'robot',
          color: 'rojo',
          precio: 5,
        },
      })
      .expect(200);

    expect(attack.body.correct).toBe(false);
    const lab = await agent.get('/api/game/lab').expect(200);
    expect(lab.body.toys).toHaveLength(4);
  });

  it('todas las lecciones del currículo son jugables de principio a fin', async () => {
    // Comprobación de contenido: cada lección tiene misión, práctica y 3 preguntas.
    for (const lesson of LESSONS) {
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.checks).toHaveLength(3);
      expect(lesson.demo.length).toBeGreaterThanOrEqual(3);
      expect(lesson.badge.key).toBeTruthy();
      expect(lesson.order).toBeGreaterThanOrEqual(0);
    }
  });
});
