import type { Lesson } from './types.js';

/**
 * Currículo completo: de "qué es un dato" a INNER JOIN.
 * Todo el texto está pensado para leerse en voz alta a un niño de 5 años.
 */
export const LESSONS: Lesson[] = [
  {
    id: 'hola-byte',
    order: 0,
    title: 'Hola, soy Byte',
    zone: 'playa',
    concept: 'Diagnóstico amable',
    objective: 'Conocer a Byte y descubrir que los datos son cosas que podemos guardar.',
    analogy:
      'Byte el Ajolote lleva una mochila llena de tesoros de información. Cada tesoro es un dato.',
    demo: [
      { title: 'Byte te saluda', text: 'Byte vive en la isla y guarda tesoros de información.' },
      { title: 'Un dato es una cosa que sabemos', text: 'Tu color favorito es un dato. El nombre de tu mascota también.' },
      { title: 'Nada de notas malas', text: 'Aquí solo se aprende probando. Si algo sale mal, Byte te ayuda.' },
    ],
    mission: {
      kind: 'choice',
      prompt: '¿Qué guarda Byte en su mochila?',
      options: [
        { id: 'a', label: 'Datos y tesoros', emoji: '🎒' },
        { id: 'b', label: 'Solo aire', emoji: '💨' },
        { id: 'c', label: 'Nada', emoji: '🚫' },
      ],
      correctId: 'a',
      explanation: '¡Sí! La mochila de Byte guarda datos: información pequeñita y útil.',
    },
    practice: {
      kind: 'choice',
      prompt: '¿Cuál de estas cosas es un dato?',
      options: [
        { id: 'a', label: 'El color azul', emoji: '🔵' },
        { id: 'b', label: 'Un salto', emoji: '🤸' },
        { id: 'c', label: 'Un sueño', emoji: '💭' },
      ],
      correctId: 'a',
      explanation: 'El color azul se puede guardar y leer. ¡Es un dato!',
    },
    hints: [
      'Mira la mochila de Byte: está llena de cositas.',
      'Un dato es algo que podemos escribir y volver a leer.',
      'La respuesta correcta es «Datos y tesoros».',
    ],
    successMessage: '¡Genial! Ya eres amigo de Byte.',
    errorFeedback: 'Casi. Prueba otra vez: Byte guarda información.',
    checks: [
      {
        id: 'c1',
        question: '¿Cómo se llama tu guía en la isla?',
        options: [
          { id: 'a', label: 'Byte el Ajolote', emoji: '🦎' },
          { id: 'b', label: 'Rex el Dragón', emoji: '🐉' },
          { id: 'c', label: 'Luna la Ballena', emoji: '🐋' },
        ],
        correctId: 'a',
        explanation: 'Byte el Ajolote te acompaña en todas las misiones.',
      },
      {
        id: 'c2',
        question: '¿Qué podemos guardar en una computadora?',
        options: [
          { id: 'a', label: 'Información', emoji: '📦' },
          { id: 'b', label: 'Un estornudo', emoji: '🤧' },
          { id: 'c', label: 'La lluvia', emoji: '🌧️' },
        ],
        correctId: 'a',
        explanation: 'Guardamos información: nombres, números, colores…',
      },
      {
        id: 'c3',
        question: 'Si pierdes un dato, ¿qué pasa?',
        options: [
          { id: 'a', label: 'Dejamos de saber algo', emoji: '❓' },
          { id: 'b', label: 'Todo sigue igual', emoji: '🙂' },
          { id: 'c', label: 'Aparece un tesoro', emoji: '💎' },
        ],
        correctId: 'a',
        explanation: 'Por eso guardamos los datos con cuidado.',
      },
    ],
    badge: { key: 'amigo-de-byte', label: 'Amigo de Byte', emoji: '🦎' },
  },

  {
    id: 'armario-de-datos',
    order: 1,
    title: 'El armario de los datos',
    zone: 'playa',
    concept: 'Qué es una base de datos',
    objective: 'Entender que una base de datos es un lugar ordenado para guardar información.',
    analogy:
      'Una base de datos es un armario con cajones. Cada cajón guarda un tipo de cosa y siempre sabes dónde buscarla.',
    demo: [
      { title: 'Muchos juguetes', text: 'En la isla hay juguetes, mascotas y dueños. Son muchos datos.' },
      { title: 'Un armario ordenado', text: 'Si todo está en su cajón, encuentras lo que buscas rapidísimo.' },
      { title: 'Ese armario tiene nombre', text: 'Se llama base de datos. MySQL es un armario muy famoso.' },
    ],
    mission: {
      kind: 'choice',
      prompt: 'La isla guarda toda su información en un armario ordenado. ¿Cómo se llama?',
      options: [
        { id: 'a', label: 'Base de datos', emoji: '🗄️' },
        { id: 'b', label: 'Caja de arena', emoji: '🏖️' },
        { id: 'c', label: 'Nube de lluvia', emoji: '🌧️' },
      ],
      correctId: 'a',
      explanation: '¡Exacto! Una base de datos guarda información ordenada para encontrarla fácil.',
    },
    practice: {
      kind: 'choice',
      prompt: '¿Para qué sirve una base de datos?',
      options: [
        { id: 'a', label: 'Para guardar y encontrar información', emoji: '🔎' },
        { id: 'b', label: 'Para pintar paredes', emoji: '🎨' },
        { id: 'c', label: 'Para hacer música', emoji: '🎵' },
      ],
      correctId: 'a',
      explanation: 'Guardar y encontrar: eso hacen las bases de datos.',
    },
    hints: [
      'Piensa en un armario con cajones etiquetados.',
      'Ese armario guarda información ordenada.',
      'Se llama base de datos.',
    ],
    successMessage: '¡Muy bien! Ya conoces el armario de los datos.',
    errorFeedback: 'Casi. Recuerda: es un armario ordenado de información.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué es una base de datos?',
        options: [
          { id: 'a', label: 'Un lugar ordenado para guardar información', emoji: '🗄️' },
          { id: 'b', label: 'Un juguete de cuerda', emoji: '🧸' },
          { id: 'c', label: 'Una canción', emoji: '🎶' },
        ],
        correctId: 'a',
        explanation: 'Ordenada y fácil de buscar.',
      },
      {
        id: 'c2',
        question: '¿Qué programa de armario usamos en este juego?',
        options: [
          { id: 'a', label: 'MySQL', emoji: '🐬' },
          { id: 'b', label: 'Paint', emoji: '🖌️' },
          { id: 'c', label: 'Reloj', emoji: '⏰' },
        ],
        correctId: 'a',
        explanation: 'MySQL es el armario de datos que vamos a aprender.',
      },
      {
        id: 'c3',
        question: 'Si el armario está desordenado, ¿qué pasa?',
        options: [
          { id: 'a', label: 'Tardamos más en encontrar las cosas', emoji: '🐢' },
          { id: 'b', label: 'Todo se vuelve más rápido', emoji: '🚀' },
          { id: 'c', label: 'Nada cambia', emoji: '😐' },
        ],
        correctId: 'a',
        explanation: 'El orden nos ayuda a encontrar rápido.',
      },
    ],
    badge: { key: 'explorador-de-datos', label: 'Explorador de datos', emoji: '🗄️' },
  },

  {
    id: 'filas-y-columnas',
    order: 2,
    title: 'Filas y columnas',
    zone: 'pueblo',
    concept: 'Tablas, filas y columnas',
    objective: 'Reconocer una tabla, una fila y una columna dentro de la caja de juguetes.',
    analogy:
      'Una tabla es una lista ordenada. Cada fila es un juguete. Cada columna es una característica, como el color.',
    demo: [
      { title: 'La tabla', text: 'La caja de juguetes se dibuja como una tabla con filas y columnas.' },
      { title: 'Una fila', text: 'La fila de Max tiene su nombre, su tipo, su color y su precio.' },
      { title: 'Una columna', text: 'La columna «color» tiene el color de todos los juguetes.' },
    ],
    mission: {
      kind: 'pick-cell',
      prompt: 'Toca el nombre del tercer juguete (Max).',
      table: 'juguetes',
      target: { row: 2, column: 'nombre' },
      explanation: 'Ese es el nombre de Max, en la fila 3 y en la columna «nombre».',
    },
    practice: {
      kind: 'pick-cell',
      prompt: 'Toca el precio del primer juguete (Tito).',
      table: 'juguetes',
      target: { row: 0, column: 'precio' },
      explanation: 'El precio está en la columna «precio» de la fila de Tito.',
    },
    hints: [
      'Cuenta las filas desde arriba: 1, 2, 3…',
      'El nombre está en la columna «nombre».',
      'Max es el tercer juguete de la lista.',
    ],
    successMessage: '¡Bien! Ya sabes leer filas y columnas.',
    errorFeedback: 'Ese no es. Mira la columna «nombre» y cuenta hasta la tercera fila.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué es una fila?',
        options: [
          { id: 'a', label: 'Una cosa completa de la tabla', emoji: '🧸' },
          { id: 'b', label: 'Una característica', emoji: '🎨' },
          { id: 'c', label: 'El nombre de la tabla', emoji: '🏷️' },
        ],
        correctId: 'a',
        explanation: 'Una fila es un juguete con todos sus datos.',
      },
      {
        id: 'c2',
        question: '¿Qué es una columna?',
        options: [
          { id: 'a', label: 'Una característica de todas las filas', emoji: '📏' },
          { id: 'b', label: 'Un juguete nuevo', emoji: '🎁' },
          { id: 'c', label: 'Una base de datos', emoji: '🗄️' },
        ],
        correctId: 'a',
        explanation: 'La columna «color» guarda el color de todos.',
      },
      {
        id: 'c3',
        question: '¿Cuántas filas tiene la caja de juguetes?',
        options: [
          { id: 'a', label: '5', emoji: '5️⃣' },
          { id: 'b', label: '3', emoji: '3️⃣' },
          { id: 'c', label: '10', emoji: '🔟' },
        ],
        correctId: 'a',
        explanation: 'Tito, Luna, Max, Nube y Rayo: cinco juguetes.',
      },
    ],
    badge: { key: 'lector-de-tablas', label: 'Lector de tablas', emoji: '📋' },
  },

  {
    id: 'tipos-de-datos',
    order: 3,
    title: 'Texto, número y fecha',
    zone: 'taller',
    concept: 'Tipos de datos',
    objective: 'Distinguir los tres tipos de datos más comunes.',
    analogy:
      'Cada cajón del taller guarda una forma distinta: letras en uno, números en otro y fechas en el último.',
    demo: [
      { title: 'Texto', text: '«Max» y «rojo» son texto. Se escriben con letras.' },
      { title: 'Número', text: '25 y 8 son números. Se pueden sumar.' },
      { title: 'Fecha', text: '2026-10-29 es una fecha: año, mes y día.' },
    ],
    mission: {
      kind: 'choice',
      prompt: 'El precio 25 del robot Max es…',
      options: [
        { id: 'a', label: 'Un número', emoji: '🔢' },
        { id: 'b', label: 'Texto', emoji: '🔤' },
        { id: 'c', label: 'Una fecha', emoji: '📅' },
      ],
      correctId: 'a',
      explanation: '25 es un número: podemos sumarlo o compararlo.',
    },
    practice: {
      kind: 'choice',
      prompt: 'El nombre «Max» es…',
      options: [
        { id: 'a', label: 'Texto', emoji: '🔤' },
        { id: 'b', label: 'Un número', emoji: '🔢' },
        { id: 'c', label: 'Una fecha', emoji: '📅' },
      ],
      correctId: 'a',
      explanation: 'Los nombres son texto: letras que se leen.',
    },
    hints: [
      '¿Se puede sumar? Entonces es un número.',
      '¿Tiene año, mes y día? Entonces es una fecha.',
      'Si son letras, es texto.',
    ],
    successMessage: '¡Eres un clasificador de datos!',
    errorFeedback: 'Piensa: ¿se suma, se lee o es un día del calendario?',
    checks: [
      {
        id: 'c1',
        question: '«rojo» es…',
        options: [
          { id: 'a', label: 'Texto', emoji: '🔤' },
          { id: 'b', label: 'Número', emoji: '🔢' },
          { id: 'c', label: 'Fecha', emoji: '📅' },
        ],
        correctId: 'a',
        explanation: 'Los colores escritos son texto.',
      },
      {
        id: 'c2',
        question: '2026-10-29 es…',
        options: [
          { id: 'a', label: 'Una fecha', emoji: '📅' },
          { id: 'b', label: 'Un texto cualquiera', emoji: '🔤' },
          { id: 'c', label: 'Un precio', emoji: '💰' },
        ],
        correctId: 'a',
        explanation: 'Año, mes y día: es una fecha.',
      },
      {
        id: 'c3',
        question: '8 es…',
        options: [
          { id: 'a', label: 'Un número', emoji: '🔢' },
          { id: 'b', label: 'Texto', emoji: '🔤' },
          { id: 'c', label: 'Una fecha', emoji: '📅' },
        ],
        correctId: 'a',
        explanation: 'Se puede sumar: es un número.',
      },
    ],
    badge: { key: 'guardian-de-tipos', label: 'Guardián de tipos', emoji: '🔢' },
  },

  {
    id: 'crear-tabla',
    order: 4,
    title: 'Construir una tabla',
    zone: 'taller',
    concept: 'CREATE DATABASE y CREATE TABLE',
    objective: 'Ver cómo MySQL crea una base de datos y una tabla (demostración).',
    analogy:
      'Primero construyes el armario (la base de datos) y después colocas los cajones con su etiqueta (la tabla).',
    demo: [
      { title: 'Crear el armario', text: 'Pedimos a MySQL un armario nuevo para la isla.', sql: 'CREATE DATABASE isla;' },
      {
        title: 'Crear un cajón',
        text: 'Cada columna lleva su nombre y su tipo de dato.',
        sql: 'CREATE TABLE juguetes (\n  id INT PRIMARY KEY,\n  nombre VARCHAR(40),\n  color VARCHAR(20),\n  precio INT\n);',
      },
      { title: 'Listo para llenar', text: 'La tabla existe, pero todavía no tiene juguetes dentro.' },
    ],
    mission: {
      kind: 'choice',
      prompt: '¿Cuál instrucción crea una tabla?',
      options: [
        { id: 'a', label: 'CREATE TABLE juguetes (…)', emoji: '🛠️' },
        { id: 'b', label: 'SELECT * FROM juguetes;', emoji: '👀' },
        { id: 'c', label: 'DELETE FROM juguetes;', emoji: '🗑️' },
      ],
      correctId: 'a',
      explanation: 'CREATE TABLE construye la tabla. SELECT solo mira.',
    },
    practice: {
      kind: 'choice',
      prompt: '¿Cuál instrucción crea una base de datos?',
      options: [
        { id: 'a', label: 'CREATE DATABASE isla;', emoji: '🗄️' },
        { id: 'b', label: 'CREATE TABLE isla;', emoji: '📋' },
        { id: 'c', label: 'SELECT isla;', emoji: '🔎' },
      ],
      correctId: 'a',
      explanation: 'CREATE DATABASE crea el armario completo.',
    },
    hints: [
      'Busca la palabra CREATE.',
      'Para el armario completo: CREATE DATABASE.',
      'Para un cajón: CREATE TABLE.',
    ],
    successMessage: '¡Ya sabes cómo nace una tabla!',
    errorFeedback: 'Mira la primera palabra: CREATE construye cosas nuevas.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué crea CREATE DATABASE?',
        options: [
          { id: 'a', label: 'Un armario de datos', emoji: '🗄️' },
          { id: 'b', label: 'Una fila', emoji: '➖' },
          { id: 'c', label: 'Un dibujo', emoji: '🖼️' },
        ],
        correctId: 'a',
        explanation: 'Crea la base de datos completa.',
      },
      {
        id: 'c2',
        question: 'En CREATE TABLE juguetes (id INT…), ¿qué es INT?',
        options: [
          { id: 'a', label: 'Un tipo de dato: número entero', emoji: '🔢' },
          { id: 'b', label: 'El nombre del juguete', emoji: '🧸' },
          { id: 'c', label: 'Un color', emoji: '🎨' },
        ],
        correctId: 'a',
        explanation: 'INT guarda números enteros.',
      },
      {
        id: 'c3',
        question: 'Después de CREATE TABLE, ¿la tabla tiene juguetes?',
        options: [
          { id: 'a', label: 'No, está vacía hasta usar INSERT', emoji: '📭' },
          { id: 'b', label: 'Sí, viene llena', emoji: '📦' },
          { id: 'c', label: 'Solo los fines de semana', emoji: '📅' },
        ],
        correctId: 'a',
        explanation: 'La tabla nace vacía. INSERT añade filas.',
      },
    ],
    badge: { key: 'constructor', label: 'Constructor de tablas', emoji: '🛠️' },
  },

  {
    id: 'insert',
    order: 5,
    title: 'Guardar un juguete',
    zone: 'laboratorio',
    concept: 'INSERT INTO',
    objective: 'Añadir una fila nueva a la tabla del laboratorio.',
    analogy:
      'INSERT INTO es como poner un juguete nuevo dentro de la caja, en el hueco que le toca.',
    demo: [
      { title: 'La caja del laboratorio', text: 'Aquí podemos probar sin miedo: los juguetes son de mentira.' },
      {
        title: 'Pedimos guardar',
        text: 'Escribimos el nombre y las características del juguete nuevo.',
        sql: "INSERT INTO juguetes (nombre, tipo, color, precio)\nVALUES ('Estrella', 'peluche', 'amarillo', 10);",
      },
      { title: '¡Aparece una fila!', text: 'El juguete nuevo ya está dentro de la tabla.' },
    ],
    mission: {
      kind: 'lab-action',
      prompt: 'Guarda a «Estrella», un peluche amarillo que cuesta 10.',
      action: 'insert',
      expected: { nombre: 'Estrella', tipo: 'peluche', color: 'amarillo', precio: 10 },
      explanation: 'INSERT INTO añadió una fila nueva con esos datos.',
    },
    practice: {
      kind: 'lab-action',
      prompt: 'Guarda a «Cometa», un carro morado que cuesta 18.',
      action: 'insert',
      expected: { nombre: 'Cometa', tipo: 'carro', color: 'morado', precio: 18 },
      explanation: 'Cada INSERT añade una fila. ¡Ya hay dos juguetes nuevos!',
    },
    hints: [
      'Elige el nombre exactamente como te lo piden.',
      'El tipo es «peluche» y el color «amarillo».',
      'El precio es 10.',
    ],
    successMessage: '¡Guardado! La caja tiene un juguete más.',
    errorFeedback: 'Casi. Revisa nombre, tipo, color y precio antes de guardar.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué hace INSERT INTO?',
        options: [
          { id: 'a', label: 'Agrega una fila nueva', emoji: '➕' },
          { id: 'b', label: 'Borra una fila', emoji: '🗑️' },
          { id: 'c', label: 'Ordena la tabla', emoji: '🔀' },
        ],
        correctId: 'a',
        explanation: 'INSERT agrega datos nuevos.',
      },
      {
        id: 'c2',
        question: '¿Qué palabra va después de INSERT INTO?',
        options: [
          { id: 'a', label: 'El nombre de la tabla', emoji: '📋' },
          { id: 'b', label: 'Un color', emoji: '🎨' },
          { id: 'c', label: 'El nombre del niño', emoji: '🙋' },
        ],
        correctId: 'a',
        explanation: 'INSERT INTO juguetes … indica la tabla destino.',
      },
      {
        id: 'c3',
        question: '¿Los juguetes del laboratorio son reales?',
        options: [
          { id: 'a', label: 'No, son de mentira y se pueden reiniciar', emoji: '🧪' },
          { id: 'b', label: 'Sí, son de la tienda', emoji: '🏪' },
          { id: 'c', label: 'Son de otro niño', emoji: '👦' },
        ],
        correctId: 'a',
        explanation: 'Es un laboratorio seguro con datos ficticios.',
      },
    ],
    badge: { key: 'guardian-de-filas', label: 'Guardián de filas', emoji: '➕' },
  },

  {
    id: 'select',
    order: 6,
    title: 'Elegir qué ver',
    zone: 'cueva',
    concept: 'SELECT',
    objective: 'Elegir qué columnas mostrar de una tabla.',
    analogy: 'SELECT es una linterna: ilumina solo las columnas que quieres mirar.',
    demo: [
      { title: 'Todo a oscuras', text: 'La cueva tiene muchos datos y no queremos verlos todos.' },
      { title: 'Enciende dos columnas', text: 'Pedimos el nombre y el color de cada juguete.' },
      { title: 'El resultado', text: 'MySQL devuelve solo esas dos columnas.', sql: 'SELECT nombre, color FROM juguetes;' },
    ],
    mission: {
      kind: 'build-query',
      prompt: 'Muestra el nombre y el color de todos los juguetes.',
      table: 'juguetes',
      expected: { select: ['nombre', 'color'], from: 'juguetes' },
      allowed: { columns: ['nombre', 'tipo', 'color', 'precio'] },
      explanation: 'SELECT nombre, color FROM juguetes; muestra esas dos columnas.',
    },
    practice: {
      kind: 'build-query',
      prompt: 'Muestra el nombre y el precio de todos los juguetes.',
      table: 'juguetes',
      expected: { select: ['nombre', 'precio'], from: 'juguetes' },
      allowed: { columns: ['nombre', 'tipo', 'color', 'precio'] },
      explanation: 'Elegiste las columnas nombre y precio.',
    },
    hints: [
      'Toca las columnas que quieres iluminar.',
      'Son dos: nombre y color.',
      'La consulta es SELECT nombre, color FROM juguetes;',
    ],
    successMessage: '¡La linterna funciona!',
    errorFeedback: 'Revisa qué columnas elegiste. Solo deben estar las que te piden.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué hace SELECT?',
        options: [
          { id: 'a', label: 'Elige qué datos ver', emoji: '🔦' },
          { id: 'b', label: 'Borra datos', emoji: '🗑️' },
          { id: 'c', label: 'Crea tablas', emoji: '🛠️' },
        ],
        correctId: 'a',
        explanation: 'SELECT solo muestra, no cambia nada.',
      },
      {
        id: 'c2',
        question: 'En SELECT nombre FROM juguetes;, ¿qué ves?',
        options: [
          { id: 'a', label: 'Solo la columna nombre', emoji: '📛' },
          { id: 'b', label: 'Todas las columnas', emoji: '📋' },
          { id: 'c', label: 'Nada', emoji: '🚫' },
        ],
        correctId: 'a',
        explanation: 'Pediste una sola columna.',
      },
      {
        id: 'c3',
        question: '¿SELECT cambia los datos de la tabla?',
        options: [
          { id: 'a', label: 'No, solo los muestra', emoji: '👀' },
          { id: 'b', label: 'Sí, los borra', emoji: '💥' },
          { id: 'c', label: 'Sí, los ordena para siempre', emoji: '🔀' },
        ],
        correctId: 'a',
        explanation: 'SELECT es seguro: solo mira.',
      },
    ],
    badge: { key: 'linterna-select', label: 'Linterna SELECT', emoji: '🔦' },
  },

  {
    id: 'where',
    order: 7,
    title: 'El filtro del bosque',
    zone: 'bosque',
    concept: 'WHERE',
    objective: 'Filtrar filas con una condición sencilla.',
    analogy: 'WHERE es un colador: solo pasan las filas que cumplen la condición.',
    demo: [
      { title: 'Muchas hojas', text: 'El bosque tiene muchos juguetes y solo quieres los verdes.' },
      { title: 'Pon la condición', text: 'Pedimos color = verde.' },
      { title: 'Solo pasa Tito', text: 'El colador deja pasar únicamente las filas verdes.', sql: "SELECT nombre FROM juguetes WHERE color = 'verde';" },
    ],
    mission: {
      kind: 'build-query',
      prompt: 'Muestra el nombre de los juguetes de color verde.',
      table: 'juguetes',
      expected: { select: ['nombre'], from: 'juguetes', where: { column: 'color', op: '=', value: 'verde' } },
      allowed: {
        columns: ['nombre', 'tipo', 'color', 'precio'],
        where: { columns: ['color', 'tipo'], ops: ['=', '!='] },
      },
      explanation: "WHERE color = 'verde' deja pasar solo a Tito.",
    },
    practice: {
      kind: 'build-query',
      prompt: 'Muestra el nombre y el precio de los juguetes de tipo robot.',
      table: 'juguetes',
      expected: {
        select: ['nombre', 'precio'],
        from: 'juguetes',
        where: { column: 'tipo', op: '=', value: 'robot' },
      },
      allowed: {
        columns: ['nombre', 'tipo', 'color', 'precio'],
        where: { columns: ['color', 'tipo'], ops: ['=', '!='] },
      },
      explanation: "WHERE tipo = 'robot' deja pasar solo a Max.",
    },
    hints: [
      'Usa la pieza WHERE y elige la columna color.',
      'La condición es color = verde.',
      "SELECT nombre FROM juguetes WHERE color = 'verde';",
    ],
    successMessage: '¡El colador funcionó!',
    errorFeedback: 'Revisa la condición: debe filtrar por la columna que te piden.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué hace WHERE?',
        options: [
          { id: 'a', label: 'Elige solo las filas que cumplen una condición', emoji: '🧹' },
          { id: 'b', label: 'Ordena las filas', emoji: '🔀' },
          { id: 'c', label: 'Borra la tabla', emoji: '🗑️' },
        ],
        correctId: 'a',
        explanation: 'WHERE filtra filas.',
      },
      {
        id: 'c2',
        question: "SELECT nombre FROM juguetes WHERE color = 'azul'; ¿qué muestra?",
        options: [
          { id: 'a', label: 'Solo a Luna', emoji: '🔵' },
          { id: 'b', label: 'Todos los juguetes', emoji: '📦' },
          { id: 'c', label: 'Ninguno', emoji: '🚫' },
        ],
        correctId: 'a',
        explanation: 'Luna es la única azul.',
      },
      {
        id: 'c3',
        question: '¿Puedes usar WHERE con un número?',
        options: [
          { id: 'a', label: 'Sí, por ejemplo precio > 10', emoji: '🔢' },
          { id: 'b', label: 'No, solo con colores', emoji: '🎨' },
          { id: 'c', label: 'Solo los lunes', emoji: '📅' },
        ],
        correctId: 'a',
        explanation: 'WHERE compara textos y números.',
      },
    ],
    badge: { key: 'filtro-verde', label: 'Filtro del bosque', emoji: '🌿' },
  },

  {
    id: 'order-limit',
    order: 8,
    title: 'El puente ordenado',
    zone: 'puente',
    concept: 'ORDER BY y LIMIT',
    objective: 'Ordenar resultados y quedarse con los primeros.',
    analogy:
      'ORDER BY ordena las tablas del puente. LIMIT corta la fila: solo pasan los primeros.',
    demo: [
      { title: 'Desorden', text: 'Los juguetes llegan al puente sin orden.' },
      { title: 'Ordena por precio', text: 'Pedimos de mayor a menor precio.', sql: 'ORDER BY precio DESC' },
      { title: 'Solo dos pasan', text: 'LIMIT 2 deja pasar solo a los dos primeros.', sql: 'LIMIT 2' },
    ],
    mission: {
      kind: 'build-query',
      prompt: 'Muestra el nombre y el precio de los 2 juguetes más caros.',
      table: 'juguetes',
      expected: {
        select: ['nombre', 'precio'],
        from: 'juguetes',
        orderBy: { column: 'precio', dir: 'DESC' },
        limit: 2,
      },
      allowed: {
        columns: ['nombre', 'tipo', 'color', 'precio'],
        orderBy: ['precio', 'nombre'],
        limit: [1, 2, 3],
      },
      explanation: 'Max (25) y Rayo (20) son los dos más caros.',
    },
    practice: {
      kind: 'build-query',
      prompt: 'Muestra el nombre de los 3 primeros juguetes ordenados por nombre.',
      table: 'juguetes',
      expected: {
        select: ['nombre'],
        from: 'juguetes',
        orderBy: { column: 'nombre', dir: 'ASC' },
        limit: 3,
      },
      allowed: {
        columns: ['nombre', 'tipo', 'color', 'precio'],
        orderBy: ['precio', 'nombre'],
        limit: [1, 2, 3],
      },
      explanation: 'Ordenados por nombre: Luna, Max y Nube.',
    },
    hints: [
      'Primero elige ORDER BY y la columna precio.',
      'DESC significa de mayor a menor.',
      'Después pon LIMIT 2.',
    ],
    successMessage: '¡Cruzaste el puente en orden!',
    errorFeedback: 'Revisa la dirección del orden y el número del límite.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué hace ORDER BY?',
        options: [
          { id: 'a', label: 'Ordena las filas', emoji: '🔀' },
          { id: 'b', label: 'Borra filas', emoji: '🗑️' },
          { id: 'c', label: 'Crea columnas', emoji: '➕' },
        ],
        correctId: 'a',
        explanation: 'Ordena según la columna que elijas.',
      },
      {
        id: 'c2',
        question: '¿Qué hace LIMIT 2?',
        options: [
          { id: 'a', label: 'Muestra solo 2 filas', emoji: '✌️' },
          { id: 'b', label: 'Muestra 2 tablas', emoji: '📋' },
          { id: 'c', label: 'Duplica las filas', emoji: '👯' },
        ],
        correctId: 'a',
        explanation: 'LIMIT corta el resultado.',
      },
      {
        id: 'c3',
        question: 'DESC significa…',
        options: [
          { id: 'a', label: 'De mayor a menor', emoji: '⬇️' },
          { id: 'b', label: 'De menor a mayor', emoji: '⬆️' },
          { id: 'c', label: 'Al azar', emoji: '🎲' },
        ],
        correctId: 'a',
        explanation: 'DESC baja; ASC sube.',
      },
    ],
    badge: { key: 'puente-ordenado', label: 'Puente ordenado', emoji: '🌉' },
  },

  {
    id: 'update-delete',
    order: 9,
    title: 'Cambiar con cuidado',
    zone: 'laboratorio',
    concept: 'UPDATE y DELETE',
    objective: 'Cambiar un dato y borrar una fila, siempre con confirmación.',
    analogy:
      'UPDATE es borrar y reescribir una etiqueta. DELETE es sacar un juguete de la caja para siempre.',
    demo: [
      { title: 'Cambiar un color', text: 'El robot era rojo y ahora será morado.', sql: "UPDATE juguetes SET color = 'morado' WHERE nombre = 'Robot';" },
      { title: 'Borrar un juguete', text: 'Sacamos la pelota de la caja.', sql: "DELETE FROM juguetes WHERE nombre = 'Pelota';" },
      { title: 'Siempre con WHERE', text: 'Sin WHERE, ¡cambiaríamos o borraríamos todo! Por eso el laboratorio pide confirmación.' },
    ],
    mission: {
      kind: 'lab-action',
      prompt: 'Cambia el color del robot a morado.',
      action: 'update',
      targetName: 'Robot',
      field: 'color',
      expectedValue: 'morado',
      explanation: 'UPDATE cambió solo la fila del robot.',
    },
    practice: {
      kind: 'lab-action',
      prompt: 'Borra la pelota del laboratorio.',
      action: 'delete',
      targetName: 'Pelota',
      explanation: 'DELETE quitó solo esa fila.',
    },
    hints: [
      'Primero elige el juguete correcto.',
      'El nuevo color es morado.',
      'Para borrar, confirma que es la pelota y no otro juguete.',
    ],
    successMessage: '¡Cambio hecho con cuidado!',
    errorFeedback: 'Revisa qué juguete elegiste antes de confirmar.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué hace UPDATE?',
        options: [
          { id: 'a', label: 'Cambia un dato que ya existe', emoji: '✏️' },
          { id: 'b', label: 'Crea una tabla', emoji: '🛠️' },
          { id: 'c', label: 'Muestra datos', emoji: '👀' },
        ],
        correctId: 'a',
        explanation: 'UPDATE modifica filas existentes.',
      },
      {
        id: 'c2',
        question: '¿Qué hace DELETE?',
        options: [
          { id: 'a', label: 'Quita una fila', emoji: '🗑️' },
          { id: 'b', label: 'Ordena filas', emoji: '🔀' },
          { id: 'c', label: 'Suma filas', emoji: '➕' },
        ],
        correctId: 'a',
        explanation: 'DELETE borra filas.',
      },
      {
        id: 'c3',
        question: 'Antes de borrar, ¿qué debemos hacer?',
        options: [
          { id: 'a', label: 'Revisar y confirmar', emoji: '✅' },
          { id: 'b', label: 'Cerrar los ojos', emoji: '🙈' },
          { id: 'c', label: 'Borrar todo', emoji: '💥' },
        ],
        correctId: 'a',
        explanation: 'Confirmar evita borrar lo que no queremos.',
      },
    ],
    badge: { key: 'cuidador-del-laboratorio', label: 'Cuidador del laboratorio', emoji: '🧪' },
  },

  {
    id: 'claves',
    order: 10,
    title: 'La etiqueta única',
    zone: 'castillo',
    concept: 'Clave primaria y clave foránea',
    objective: 'Entender para qué sirven la clave primaria y la clave foránea.',
    analogy:
      'La clave primaria es el número de tu mochila: no se repite. La clave foránea es una nota que dice «mi dueño es el número 2».',
    demo: [
      { title: 'Cada mascota tiene su número', text: 'En mascotas, la columna id es única: 1, 2, 3, 4, 5.' },
      { title: 'Ese número es la clave primaria', text: 'Nunca se repite y siempre identifica una mascota.' },
      { title: 'La nota del dueño', text: 'id_dueno guarda el número de otro tabla: es la clave foránea.' },
    ],
    mission: {
      kind: 'choice',
      prompt: 'En la tabla mascotas, ¿cuál es la clave primaria?',
      options: [
        { id: 'a', label: 'id', emoji: '🔑' },
        { id: 'b', label: 'nombre', emoji: '📛' },
        { id: 'c', label: 'especie', emoji: '🐾' },
      ],
      correctId: 'a',
      explanation: 'id identifica cada mascota y no se repite.',
    },
    practice: {
      kind: 'choice',
      prompt: 'En mascotas, la columna id_dueno es una clave…',
      options: [
        { id: 'a', label: 'Foránea: apunta a otra tabla', emoji: '🔗' },
        { id: 'b', label: 'Primaria', emoji: '🔑' },
        { id: 'c', label: 'De color', emoji: '🎨' },
      ],
      correctId: 'a',
      explanation: 'id_dueno apunta al id de la tabla duenos.',
    },
    hints: [
      'La clave primaria nunca se repite.',
      'En mascotas, cada fila tiene un id distinto.',
      'id_dueno apunta a otra tabla: es foránea.',
    ],
    successMessage: '¡Las llaves del castillo son tuyas!',
    errorFeedback: 'Recuerda: primaria = única; foránea = apunta a otra tabla.',
    checks: [
      {
        id: 'c1',
        question: '¿Puede repetirse una clave primaria?',
        options: [
          { id: 'a', label: 'No, nunca', emoji: '🚫' },
          { id: 'b', label: 'Sí, siempre', emoji: '👯' },
          { id: 'c', label: 'Solo los martes', emoji: '📅' },
        ],
        correctId: 'a',
        explanation: 'Si se repitiera, no sabríamos qué fila es cuál.',
      },
      {
        id: 'c2',
        question: '¿Para qué sirve una clave foránea?',
        options: [
          { id: 'a', label: 'Para conectar dos tablas', emoji: '🔗' },
          { id: 'b', label: 'Para pintar filas', emoji: '🎨' },
          { id: 'c', label: 'Para borrar tablas', emoji: '🗑️' },
        ],
        correctId: 'a',
        explanation: 'Conecta una fila con su dueño en otra tabla.',
      },
      {
        id: 'c3',
        question: 'La mascota Nube tiene id_dueno = 3. ¿De quién es?',
        options: [
          { id: 'a', label: 'De Carla', emoji: '👧' },
          { id: 'b', label: 'De Ana', emoji: '👩' },
          { id: 'c', label: 'De nadie', emoji: '🚫' },
        ],
        correctId: 'a',
        explanation: 'Carla tiene el id 3.',
      },
    ],
    badge: { key: 'llaves-del-castillo', label: 'Llaves del castillo', emoji: '🔑' },
  },

  {
    id: 'relaciones',
    order: 11,
    title: 'Dos tablas amigas',
    zone: 'castillo',
    concept: 'Relaciones entre tablas',
    objective: 'Descubrir qué filas de dos tablas están conectadas.',
    analogy:
      'Cada mascota lleva una nota con el número de su dueño. Si los números coinciden, son amigos.',
    demo: [
      { title: 'Mira las dos tablas', text: 'mascotas tiene id_dueno. duenos tiene id.' },
      { title: 'Busca coincidencias', text: 'Michi (id_dueno 1) coincide con Ana (id 1).' },
      { title: 'Hay una sin pareja', text: 'Tino tiene id_dueno 9 y no existe el dueño 9.' },
    ],
    mission: {
      kind: 'join-match',
      prompt: 'Toca las mascotas que SÍ tienen un dueño en la lista.',
      leftTable: 'mascotas',
      rightTable: 'duenos',
      leftKey: 'id_dueno',
      rightKey: 'id',
      explanation: 'Michi, Firulais, Copito y Nube coinciden. Tino no.',
    },
    practice: {
      kind: 'choice',
      prompt: '¿Qué mascota NO tiene dueño en la lista?',
      options: [
        { id: 'a', label: 'Tino', emoji: '🐢' },
        { id: 'b', label: 'Michi', emoji: '🐱' },
        { id: 'c', label: 'Copito', emoji: '🐰' },
      ],
      correctId: 'a',
      explanation: 'Tino apunta al dueño 9, que no existe.',
    },
    hints: [
      'Compara id_dueno de la mascota con id del dueño.',
      'Michi va con 1, Firulais y Copito con 2, Nube con 3.',
      'Tino apunta al 9 y no hay nadie con ese número.',
    ],
    successMessage: '¡Encontraste todas las parejas!',
    errorFeedback: 'Compara los números: si no coinciden, no son pareja.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué columnas relacionan mascotas y duenos?',
        options: [
          { id: 'a', label: 'mascotas.id_dueno = duenos.id', emoji: '🔗' },
          { id: 'b', label: 'mascotas.nombre = duenos.ciudad', emoji: '❌' },
          { id: 'c', label: 'mascotas.id = duenos.id', emoji: '❌' },
        ],
        correctId: 'a',
        explanation: 'La clave foránea apunta a la clave primaria.',
      },
      {
        id: 'c2',
        question: 'Si un dueño no tiene mascotas, ¿aparece al unir?',
        options: [
          { id: 'a', label: 'No aparece', emoji: '🚫' },
          { id: 'b', label: 'Sí, siempre', emoji: '✅' },
          { id: 'c', label: 'Aparece dos veces', emoji: '👯' },
        ],
        correctId: 'a',
        explanation: 'Sin coincidencia no hay pareja.',
      },
      {
        id: 'c3',
        question: '¿Cuántas mascotas tienen dueño?',
        options: [
          { id: 'a', label: '4', emoji: '4️⃣' },
          { id: 'b', label: '5', emoji: '5️⃣' },
          { id: 'c', label: '3', emoji: '3️⃣' },
        ],
        correctId: 'a',
        explanation: 'Todas menos Tino.',
      },
    ],
    badge: { key: 'amigo-de-tablas', label: 'Amigo de las tablas', emoji: '🤝' },
  },

  {
    id: 'inner-join',
    order: 12,
    title: 'El Templo del INNER JOIN',
    zone: 'templo',
    concept: 'INNER JOIN',
    objective: 'Unir dos tablas y quedarse solo con las filas que coinciden.',
    analogy:
      'INNER JOIN es un puente entre dos tablas. Solo cruzan las parejas que tienen el mismo número.',
    demo: [
      { title: 'Dos tablas, un puente', text: 'mascotas.id_dueno se compara con duenos.id.' },
      { title: 'Cruzan las parejas', text: 'Michi con Ana, Firulais y Copito con Beto, Nube con Carla.' },
      { title: 'Tino se queda', text: 'Tino apunta al 9: no hay pareja, así que NO aparece en el resultado.' },
    ],
    mission: {
      kind: 'build-query',
      prompt: 'Une mascotas con duenos y muestra el nombre de la mascota y el de su dueño.',
      table: 'mascotas',
      expected: {
        select: ['mascotas.nombre', 'duenos.nombre'],
        from: 'mascotas',
        join: { table: 'duenos', leftColumn: 'mascotas.id_dueno', rightColumn: 'duenos.id' },
      },
      allowed: {
        columns: ['mascotas.nombre', 'mascotas.especie', 'duenos.nombre', 'duenos.ciudad'],
        join: { table: 'duenos', leftColumn: 'mascotas.id_dueno', rightColumn: 'duenos.id' },
      },
      explanation:
        'INNER JOIN devuelve 4 filas: Tino no tiene pareja y por eso no aparece.',
    },
    practice: {
      kind: 'build-query',
      prompt: 'Une mascotas con duenos y muestra el nombre de la mascota y la ciudad del dueño.',
      table: 'mascotas',
      expected: {
        select: ['mascotas.nombre', 'duenos.ciudad'],
        from: 'mascotas',
        join: { table: 'duenos', leftColumn: 'mascotas.id_dueno', rightColumn: 'duenos.id' },
      },
      allowed: {
        columns: ['mascotas.nombre', 'mascotas.especie', 'duenos.nombre', 'duenos.ciudad'],
        join: { table: 'duenos', leftColumn: 'mascotas.id_dueno', rightColumn: 'duenos.id' },
      },
      explanation: 'Ahora ves la ciudad de cada dueño, solo de las parejas que coinciden.',
    },
    hints: [
      'Activa la pieza JOIN y elige la tabla duenos.',
      'La unión es mascotas.id_dueno = duenos.id.',
      'Selecciona mascotas.nombre y duenos.nombre.',
    ],
    successMessage: '¡Cruzaste el templo! Solo pasaron las parejas.',
    errorFeedback: 'Revisa la columna de unión: debe ser id_dueno con id.',
    checks: [
      {
        id: 'c1',
        question: '¿Qué devuelve un INNER JOIN?',
        options: [
          { id: 'a', label: 'Solo las filas que coinciden', emoji: '🤝' },
          { id: 'b', label: 'Todas las filas, siempre', emoji: '📦' },
          { id: 'c', label: 'Ninguna fila', emoji: '🚫' },
        ],
        correctId: 'a',
        explanation: 'INNER JOIN se queda con las parejas.',
      },
      {
        id: 'c2',
        question: '¿Por qué Tino no aparece al unir?',
        options: [
          { id: 'a', label: 'Porque su id_dueno no existe en duenos', emoji: '9️⃣' },
          { id: 'b', label: 'Porque es una tortuga', emoji: '🐢' },
          { id: 'c', label: 'Porque se escondió', emoji: '🙈' },
        ],
        correctId: 'a',
        explanation: 'Sin coincidencia, no hay fila en el resultado.',
      },
      {
        id: 'c3',
        question: '¿Cuántas filas devuelve el INNER JOIN del ejemplo?',
        options: [
          { id: 'a', label: '4', emoji: '4️⃣' },
          { id: 'b', label: '5', emoji: '5️⃣' },
          { id: 'c', label: '3', emoji: '3️⃣' },
        ],
        correctId: 'a',
        explanation: 'Cuatro mascotas tienen dueño; Tino no.',
      },
    ],
    badge: { key: 'maestro-del-join', label: 'Maestro del JOIN', emoji: '⛩️' },
  },
];

export const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
