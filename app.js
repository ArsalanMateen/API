const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./openapi.json");
const db = require("better-sqlite3")("tasks.db");

const app = express();
const port = 3000;
db.pragma("journal_mode = WAL");

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// create table if not exists and create indexes
const createTable = () => {
  db.prepare(
    "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, mark_as_done BOOLEAN NOT NULL)",
  ).run();
  db.prepare("CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title)").run();
  db.prepare("CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(mark_as_done)").run();
};
createTable();

// insert data to database
const insertTask = (title, mark_as_done) => {
  const stmt = db.prepare(
    "INSERT INTO tasks (title, mark_as_done) VALUES (?, ?)",
  );
  return stmt.run(title, mark_as_done);
};

// Seed initial tasks wrapped in a transaction for atomicity
const seedTasks = db.transaction((tasksToSeed) => {
  const stmt = db.prepare("INSERT INTO tasks (title, mark_as_done) VALUES (?, ?)");
  for (const task of tasksToSeed) {
    stmt.run(task.title, task.mark_as_done);
  }
});

const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (taskCount.count === 0) {
  seedTasks([
    { title: "Review project requirements and set up the initial workflow", mark_as_done: 0 },
    { title: "Prepare deployment scripts and documentation", mark_as_done: 0 },
    { title: "Deploy the application to production", mark_as_done: 0 },
  ]);
}

// read all tasks (with optional search, filter by status, and sort)
app.get("/tasks", (req, res) => {
  const { search, done, mark_as_done, sort } = req.query;

  let query = "SELECT * FROM tasks";
  const conditions = [];
  const params = [];

  if (search && search.trim() !== "") {
    conditions.push("title LIKE ?");
    params.push(`%${search.trim()}%`);
  }

  const statusFilter = mark_as_done !== undefined ? mark_as_done : done;
  if (statusFilter !== undefined) {
    if (statusFilter === "true" || statusFilter === "1") {
      conditions.push("mark_as_done = 1");
    } else if (statusFilter === "false" || statusFilter === "0") {
      conditions.push("mark_as_done = 0");
    }
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  if (sort === "title" || sort === "asc") {
    query += " ORDER BY title ASC";
  } else if (sort === "desc") {
    query += " ORDER BY title DESC";
  }

  const stmt = db.prepare(query);
  const tasks = stmt.all(...params);
  res.status(200).json(tasks);
});

// read a specific task id
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const stmt = db.prepare("SELECT * FROM tasks WHERE id = ?");
  const task = stmt.get(id);

  if (!task) {
    return res.status(404).json({
      message: `Task ${id} not found`,
    });
  }
  res.status(200).json(task);
});

// create new task
app.post("/tasks", (req, res) => {
  const title = req.body.title;

  // if title is empty
  if (!title || title.trim() === "") {
    return res.status(400).json({
      message: "Bad Request: title can't be empty",
    });
  }

  const id = insertTask(title, 0).lastInsertRowid;
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  res.status(201).json({
    message: "Task created",
    task: {
      id: id,
      title: task.title,
      mark_as_done: task.mark_as_done,
    },
  });
});

// update a specific task
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  let { title, mark_as_done, done } = req.body;

  if (mark_as_done === undefined && done !== undefined) {
    mark_as_done = done;
  }

  if (title === undefined && mark_as_done === undefined) {
    return res.status(400).json({
      message: "Bad Request: Nothing to update",
    });
  }

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({
      message: "Bad Request: Empty/Invalid body",
    });
  }

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({
      message: `Task ${id} not found`,
    });
  }

  const updatedTitle = title !== undefined ? title.trim() : existing.title;
  const updatedDone = mark_as_done !== undefined ? (mark_as_done ? 1 : 0) : existing.mark_as_done;

  db.prepare("UPDATE tasks SET title = ?, mark_as_done = ? WHERE id = ?").run(
    updatedTitle,
    updatedDone,
    id
  );

  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.status(200).json(updatedTask);
});

// delete a specific task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
  const info = stmt.run(id);

  if (info.changes === 0) {
    return res.status(404).json({
      message: `Task ${id} not found`,
    });
  }

  res.status(204).send();
});

// database statistics endpoint
app.get("/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
  const completed = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE mark_as_done = 1").get().count;
  const pending = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE mark_as_done = 0").get().count;

  res.status(200).json({
    total,
    completed,
    pending,
  });
});

// root
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    verson: "1.0",
    endpoints: ["/tasks", "/tasks/:id", "/stats"],
  });
});

// server health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});
