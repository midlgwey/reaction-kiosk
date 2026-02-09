import {db} from '../db.js'
import { v4 as uuidv4 } from 'uuid';


export const createAdmin = async ({ name, lastname, email, password }) => {
  const id = uuidv4();
  await db.execute({

    sql: `INSERT INTO admins (id, name, lastname, email, password)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, name, lastname, email, password],
    
  });

  return id;
};


export const findAdminByEmail = async (email) => {
  const result = await db.execute({
    sql: `
      SELECT id, name, lastname, email, password
      FROM admins
      WHERE email = ?
      LIMIT 1
    `,
    args: [email],
  });

  return result.rows[0] || null;

};

