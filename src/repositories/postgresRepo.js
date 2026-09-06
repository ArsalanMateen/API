const BaseRepository = require("./baseRepo");

class PostgresRepository extends BaseRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findAll({ search, completed, sort } = {}) {
    let query = "SELECT id, title, completed FROM tasks";
    const conditions = [];
    const params = [];

    search = search?.trim() || "";
    if (search !== "") {
      /*
        `%${...}%` SQL Wildcard Characters, representing zero or more charactesrs.
      */
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    if (completed !== undefined) {
      const isCompleted = [true, "true"].includes(completed);
      params.push(isCompleted);
      conditions.push(`completed = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    if (sort === "title" || sort === "asc") {
      query += " ORDER BY title ASC";
    } else if (sort === "desc") {
      query += " ORDER BY title DESC";
    } else {
      query += " ORDER BY id ASC";
    }

    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      "SELECT id, title, completed FROM tasks WHERE id = $1",
      [Number(id)],
    );
    return rows[0] || null;
  }

  async create({ title, completed = false }) {
    const { rows } = await this.pool.query(
      "INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING id, title, completed",
      [title, Boolean(completed)],
    );
    return rows[0];
  }

  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title : existing.title;
    const completed =
      updates.completed !== undefined ? updates.completed : existing.completed;

    const { rows } = await this.pool.query(
      "UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING id, title, completed",
      [title, Boolean(completed), Number(id)],
    );
    return rows[0] || null;
  }

  async delete(id) {
    const res = await this.pool.query("DELETE FROM tasks WHERE id = $1", [
      Number(id),
    ]);
    return res.rowCount > 0;
  }
}

module.exports = PostgresRepository;
