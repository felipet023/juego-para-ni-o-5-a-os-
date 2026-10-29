# Instrucciones del proyecto para Codex

## Misión
Construir **SQLQuest 3D: La Isla de los Datos**, un juego educativo 3D funcional para enseñar MySQL desde cero hasta `INNER JOIN` a un niño de 5 años, usando lenguaje sencillo, ejemplos visuales y práctica guiada.

## Reglas de trabajo
1. Antes de cambiar archivos, inspecciona el repositorio, identifica herramientas y versiones, revisa `package.json` y explica el plan breve.
2. Implementa en fases pequeñas. No afirmes que algo funciona sin ejecutar los comandos de comprobación disponibles.
3. Mantén la aplicación ejecutable al final de cada fase y documenta los comandos exactos para iniciarla.
4. No borres archivos ni sobrescribas configuración existente sin necesidad y sin explicarlo.
5. Si faltan credenciales, servicios o herramientas, crea una configuración de desarrollo segura y explica qué falta; nunca inventes que un servicio está conectado.
6. Escribe código legible, modular, tipado cuando sea razonable y con comentarios útiles para un principiante.
7. No guardes contraseñas, tokens, claves ni datos personales en el repositorio.
8. Toda consulta SQL debe usar parámetros o un ORM seguro; nunca concatenar texto del usuario en SQL.
9. La interfaz infantil nunca debe exponer administración, credenciales, datos de otros jugadores ni herramientas destructivas.
10. Prioriza accesibilidad, controles simples, texto grande, colores con buen contraste y alternativa a sonidos/animaciones.
11. Añade pruebas automáticas a la lógica importante y ejecuta lint, tests y build cuando estén configurados.
12. Si una decisión afecta alcance, seguridad o datos, documenta el riesgo y elige la alternativa más segura por defecto.

## Alcance pedagógico obligatorio
Enseñar, en orden:
- qué es una base de datos y para qué sirve;
- tablas, filas y columnas;
- tipos de datos sencillos;
- `CREATE DATABASE` y `CREATE TABLE` explicados en modo demostración;
- `INSERT`, `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`;
- `UPDATE` y `DELETE` solo en un laboratorio aislado con confirmación y opción de reiniciar;
- clave primaria y clave foránea;
- relaciones entre tablas;
- `INNER JOIN` con dos tablas pequeñas, filas coincidentes destacadas y explicación de por qué las filas sin coincidencia no aparecen.

No enseñar comandos destructivos contra una base real. El juego usa una base de práctica separada y datos ficticios.

## Entregables mínimos
- Juego 3D navegable y adaptable.
- Panel de jugador y panel de administración separados por permisos.
- API backend y persistencia MySQL.
- Datos semilla ficticios.
- Autenticación segura, autorización por roles y validación.
- Pruebas, instrucciones de instalación, `.env.example` sin secretos y documentación.
