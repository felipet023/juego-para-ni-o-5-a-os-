/**
 * Configuración común de las pruebas del servidor.
 * Usa una base de datos separada (sqlquest_app_test) para no tocar los datos
 * de desarrollo ni las bases del usuario.
 */
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'sqlquest_app_test';
process.env.LOGIN_RATE_LIMIT_MAX = '1000';
process.env.APP_ORIGIN = 'http://localhost:5173';
// Credenciales solo para la base de pruebas.
process.env.ADMIN_USERNAME = 'profe';
process.env.ADMIN_PASSWORD = 'ClaveDePrueba123!';
process.env.SESSION_SECRET = 'secreto-solo-para-pruebas-automatizadas-0123456789';
