import { Pool } from "pg";
import logger from "../utils/logger";

export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

logger.info("Database pool initialized");

export async function closePool() {
  await pool.end();
}
