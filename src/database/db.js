import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

let pool = null;
const isPostgres = !!process.env.DATABASE_URL;

if (isPostgres) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('[DB] Conectado a base de datos PostgreSQL.');
} else {
  console.log('[DB] Sin DATABASE_URL configurada: utilizando almacenamiento local en memoria y archivo.');
}

// Fallback local en memoria persistido en data/local-db.json
const LOCAL_DB_PATH = path.resolve('data/local-db.json');

const loadLocalDb = () => {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    }
  } catch (e) {}
  return { users: [], states: {}, tasks: {}, projects: {}, files: {} };
};

const saveLocalDb = (data) => {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[DB] Error guardando base local:', e.message);
  }
};

export const localDb = loadLocalDb();
export const syncLocalDb = () => saveLocalDb(localDb);

export const query = async (text, params) => {
  if (pool) {
    return pool.query(text, params);
  }
  return { rows: [] };
};

export default { query, pool, isPostgres, localDb, syncLocalDb };
