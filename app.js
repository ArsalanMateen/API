const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./openapi.json");
const db = require("better-sqlite3")("tasks.db");

const app = express();
const port = 3000;
db.pragma("journal_mode = WAL");

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// create table if not exists
const createTable = () => {
  const stmt = db.prepare(
    "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, mark_as_done BOOLEAN NOT NULL)",
  );
  return stmt.run();
};
createTable();

// insert data to database
const insertTask = (title, mark_as_done) => {
  const stmt = db.prepare(
    "INSERT INTO tasks (title, mark_as_done) VALUES (?, ?)",
  );
  return stmt.run(title, mark_as_done);
};

const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (taskCount.count === 0) {
  insertTask("Review project requirements and set up the initial workflow", 0);
  insertTask("Prepare deployment scripts and documentation", 0);
  insertTask("Deploy the application to production", 0);
}

// read all tasks
app.get("/tasks", (req, res) => {
  const stmt = db.prepare("SELECT * FROM tasks");
  const tasks = stmt.all();
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

// root
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    verson: "1.0",
    endpoints: ["/tasks"],
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
