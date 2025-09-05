import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "expense_app",
  password: "yourpassword",
  port: 5432,
});

export default pool;
