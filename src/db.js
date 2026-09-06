const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/tasks_db";

const pool = new Pool({
  connectionString,
});

// handle errors on the idle clients in the pool through the EvenEmitter
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

const query = (text, params) => pool.query(text, params);

const ensureSchema = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);
  `;
  await pool.query(sql);
};

module.exports = {
  pool,
  query,
  ensureSchema,
};
