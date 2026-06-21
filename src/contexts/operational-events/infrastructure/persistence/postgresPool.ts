/* Postgres Pool Connection 
* This file is used to create a pool of connections to the PostgreSQL database.
*/

import pg from "pg";

const { Pool } = pg;

export const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});