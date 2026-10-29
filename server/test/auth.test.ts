import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, createUser, resetDatabase } from './helpers.js';

const PLAYER = { username: 'ana', password: 'ClaveAna123!' };

describe('Autenticación y sesiones', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createUser(PLAYER);
  });

  it('inicia sesión y entrega una cookie httpOnly', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ANA', password: PLAYER.password })
      .expect(200);

    expect(response.body.user).toMatchObject({ username: 'ana', role: 'player' });
    expect(response.body.user).not.toHaveProperty('password_hash');

    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies.join(';')).toContain('sq_session=');
    expect(cookies.join(';').toLowerCase()).toContain('httponly');
    expect(cookies.join(';').toLowerCase()).toContain('samesite=lax');
    expect(cookies.join(';').toLowerCase()).not.toContain('secure');
  });

  it('rechaza una clave incorrecta sin revelar si el usuario existe', async () => {
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ana', password: 'clave-mala' })
      .expect(401);

    const missing = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nadie', password: 'clave-mala' })
      .expect(401);

    expect(wrong.body.error.message).toBe(missing.body.error.message);
    expect(wrong.body.error.message).toBe('Usuario o clave incorrectos.');
  });

  it('no permite usar el juego sin sesión', async () => {
    await request(app).get('/api/game/state').expect(401);
    await request(app).get('/api/admin/overview').expect(401);
  });

  it('rechaza cuentas bloqueadas', async () => {
    await createUser({ username: 'bloqueado', password: 'ClaveBloqueada1!', isActive: false });
    await request(app)
      .post('/api/auth/login')
      .send({ username: 'bloqueado', password: 'ClaveBloqueada1!' })
      .expect(401);
  });

  it('valida el formato del usuario antes de consultar la base', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ab', password: 'x' })
      .expect(400);
    expect(response.body.error.code).toBe('validation_error');
  });

  it('cierra la sesión en el servidor al salir', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(PLAYER).expect(200);
    await agent.get('/api/game/state').expect(200);

    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/game/state').expect(401);
  });

  it('no acepta peticiones que modifican datos desde otro origen (CSRF)', async () => {
    await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://sitio-malicioso.example')
      .send(PLAYER)
      .expect(403);
  });

  it('envía cabeceras de seguridad y oculta la tecnología del servidor', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('un jugador no puede entrar al panel de administración ni cambiar su rol', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(PLAYER).expect(200);

    await agent.get('/api/admin/overview').expect(403);
    await agent.patch('/api/admin/players/1').send({ isActive: true }).expect(403);
    await agent.patch('/api/admin/players/1').send({ role: 'admin' }).expect(403);
  });

  it('rechaza JSON malformado sin romper el servidor', async () => {
    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": ')
      .expect(400);

    await request(app).get('/api/health').expect(200);
  });
});
