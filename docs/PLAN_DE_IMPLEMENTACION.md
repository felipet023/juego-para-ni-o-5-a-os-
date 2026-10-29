# Plan de implementación — SQLQuest 3D

## Fase 0: inspección
- Revisar archivos, versiones, comandos y dependencias.
- Confirmar si MySQL/Docker están disponibles.
- Definir arquitectura y registrar riesgos.

**Aceptación:** plan concreto y entorno documentado, sin cambios destructivos.

## Fase 1: base funcional
- Crear estructura frontend/backend.
- Añadir navegación, escena 3D básica, personaje y movimiento.
- Añadir configuración de entorno y README.

**Aceptación:** la app inicia y el personaje se mueve; build sin errores.

## Fase 2: primera experiencia pedagógica
- Implementar mapa, guía Byte, misiones, lecciones iniciales y feedback.
- Crear datos de ejemplo y constructor visual de consultas.

**Aceptación:** un jugador puede completar las primeras lecciones y ver resultados explicados.

## Fase 3: API, base de datos y progreso
- Crear esquema/migraciones/semillas.
- Persistir usuarios, lecciones, progreso e insignias.
- Separar datos de práctica de los datos de la aplicación.

**Aceptación:** progreso guardado y recuperable con MySQL de desarrollo.

## Fase 4: cuentas y paneles
- Implementar login, roles, panel de jugador y administración.
- Proteger permisos en backend y frontend.

**Aceptación:** pruebas demuestran que un jugador no puede acceder a funciones de administración.

## Fase 5: currículo hasta INNER JOIN
- Completar lecciones, retos, pistas y explicaciones.
- Añadir visualización de coincidencias entre tablas.

**Aceptación:** `INNER JOIN` muestra solo las filas coincidentes y explica por qué.

## Fase 6: seguridad, accesibilidad y QA
- Pruebas de autorización, validación, inyección, rate limiting y accesibilidad.
- Corregir defectos; revisar dependencias.

**Aceptación:** pruebas ejecutadas con resultados documentados y limitaciones conocidas.

## Fase 7: documentación y entrega
- Manuales, guía de despliegue, solución de problemas y lista preproducción.

**Aceptación:** otra persona puede instalar, iniciar, probar y entender el proyecto siguiendo el README.
