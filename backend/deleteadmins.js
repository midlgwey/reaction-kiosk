import { db } from './db.js';

async function deleteadmins() {
  try {
    await db.execute({
      sql: 'DELETE FROM admins;',
    });

    console.log('🗑️ Todos los admins fueron eliminados');
  } catch (error) {
    console.error('❌ Error borrando admins:', error);
  }
}

deleteadmins();
