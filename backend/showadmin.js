import { db } from './db.js';

async function showadmin() {
  try {
    const result = await db.execute({
      sql: `SELECT id, name, lastname, email FROM admins`
    });

    if (result.rows.length === 0) {
      console.log('⚠️ No hay admins en la base de datos');
    } else {
      console.log('📋 Lista de admins:');
      result.rows.forEach(admin => {
        console.log(`ID: ${admin.id} | Name: ${admin.name} ${admin.lastname} | Email: ${admin.email}`);
      });
    }
  } catch (err) {
    console.error('❌ Error mostrando admins:', err);
  }
}

// Ejecutar la función
showadmin();
