import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export const createWaiter = async ({ name, pin }) => {
  const id = uuidv4();
  await db.execute({
    sql: `INSERT INTO waiters (id, name, pin) VALUES (?, ?, ?)`,
    args: [id, name, pin],
  });
  return id;
};

export const findWaiterByPin = async (pin) => {
  const result = await db.execute({
    sql: `SELECT id, name FROM waiters WHERE pin = ? AND active = 1`,
    args: [pin],
  });
  return result.rows[0] || null;
};