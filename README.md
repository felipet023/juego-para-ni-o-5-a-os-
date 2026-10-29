# SQLQuest 3D — carpeta base para Codex y OpenCode

Esta carpeta contiene un prompt maestro para construir el juego y agentes especializados para OpenCode. Codex puede usar las instrucciones de `AGENTS.md` y el prompt de `PROMPT_MAESTRO_CODEX.md`.

## Concepto
**SQLQuest 3D: La Isla de los Datos** es un juego educativo 3D para que un niño de 5 años aprenda progresivamente conceptos básicos de MySQL hasta `INNER JOIN`, con misiones cortas, voz/texto sencillo, personajes, movimiento, recompensas y ejercicios seguros.

## Cómo usarlo
1. Extrae el ZIP en una carpeta de trabajo, por ejemplo `C:\Users\FELIPE\OneDrive\Escritorio\SQLQuest3D`.
2. Abre esa carpeta en VS Code.
3. Lee `PROMPT_MAESTRO_CODEX.md` y copia su contenido en Codex.
4. Si también usas OpenCode, conserva la carpeta `.opencode/agents/`; sus archivos describen los agentes especializados.
5. Pide que primero inspeccione el entorno y proponga un plan; después autoriza la implementación por fases.

## Estructura
- `PROMPT_MAESTRO_CODEX.md`: instrucción completa para construir el proyecto.
- `AGENTS.md`: reglas generales del repositorio para Codex.
- `.opencode/agents/`: agentes de arquitectura, 3D, enseñanza de MySQL, backend, ciberseguridad, QA y accesibilidad.
- `docs/PLAN_DE_IMPLEMENTACION.md`: fases y criterios de aceptación.

## Importante
Esta carpeta es una **base de instrucciones**, no contiene todavía el juego terminado. Los agentes son guías de trabajo: OpenCode debe cargarlos según su configuración y Codex debe seguir `AGENTS.md` y el prompt maestro. Ningún sistema puede garantizar que todo quede perfecto en una sola ejecución; trabaja por fases, ejecuta pruebas y corrige errores antes de continuar.
