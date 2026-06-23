/* Postgres Pool Connection
 * Shared pool for all bounded contexts using the same PostgreSQL database.
 */

import pg from "pg";

const { Pool } = pg;

export const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
