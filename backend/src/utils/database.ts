import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'finlens',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'finlens123',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Pool error handler
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query on the database
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export const query = async (
  text: string,
  params?: unknown[]
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns Pool client
 */
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

/**
 * Test database connection
 * @returns True if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log('📅 Current database time:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

/**
 * Close all database connections
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('Database pool closed');
};

export default {
  query,
  getClient,
  testConnection,
  closePool,
};
