import { db } from './db.js';

async function showReactionsTable() {
  try {
    const result = await db.execute("PRAGMA table_info(reactions);");
    console.log("📋 Estructura de la tabla reactions:\n");
    console.table(result.rows);
  } catch (error) {
    console.error("❌ Error consultando la tabla:", error);
  }
}

showReactionsTable();
