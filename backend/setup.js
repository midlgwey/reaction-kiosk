import { db } from './db.js';

async function createTables() {
  try {
    // 🔹 0️⃣ Borrar tabla de admins si existe
    await db.execute({ sql: `DROP TABLE IF EXISTS admins;` });

    // 1️⃣ Tabla de administradores
    await db.execute({
      sql: `
        CREATE TABLE admins (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          lastname TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        );
      `,
    });

    // 2️⃣ Tabla de preguntas
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL
        );
      `,
    });

    // Preguntas de ejemplo
    const preguntas = [
      '¿Cómo fue la atención de tu mesero?',
      '¿Tus bebidas cumplieron lo esperado?',
      '¿Qué te pareció la comida?',
      '¿Las instalaciones fueron de su agrado?'
    ];

    for (const pregunta of preguntas) {
      const exists = await db.execute({
        sql: 'SELECT 1 FROM questions WHERE text = ?',
        args: [pregunta],
      });

      if (exists.rows.length === 0) {
        await db.execute({
          sql: 'INSERT INTO questions (text) VALUES (?)',
          args: [pregunta],
        });
      }
    }

    // 3️⃣ Tabla de reacciones
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS reactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          value INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id)
        );
      `,
    });

    // 4️⃣ Tabla de acciones de admin
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS admin_actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          admin_id TEXT NOT NULL,
          action TEXT NOT NULL,
          target_table TEXT,
          target_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins(id)
        );
      `,
    });

    console.log('✅ Todas las tablas y preguntas iniciales creadas correctamente');
  } catch (err) {
    console.error('❌ Error creando tablas:', err);
  }
}

// Ejecutar la creación de tablas
createTables();
