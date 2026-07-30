const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

// in-memory list of tasks objects
const tasks = [
  {
    id: 1,
    title: "FlyRank Week 1 Assignment",
    mark_as_done: false,
  },
  {
    id: 2,
    title: "Feedback on Startup Proposal",
    mark_as_done: false,
  },
  {
    id: 3,
    title: "ML freecodecamp Playist",
    mark_as_done: false,
  },
];

// read all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// read a specific task id
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  for (const task of tasks) {
    if (task.id === id) {
      return res.status(200).json(task);
    }
  }

  res.status(404).json({
    message: `Task ${id} not found`,
  });
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

  // if tasks list is empty
  const id = tasks.id === 0 ? 1 : tasks[tasks.length - 1].id + 1;
  tasks.push({
    id: id,
    title: title,
    mark_as_done: false,
  });

  res.status(201).json({
    message: "Task created",
    task: {
      id: id,
      title: title,
      mark_as_done: false,
    },
  });
});

// update a specific task
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const title = req.body.title;
  const mark_as_done = req.body.mark_as_done;

  if (title === undefined && mark_as_done === undefined) {
    return res.status(400).json({
      message: "Bad Request: Nothing to update",
    });
  }

  for (const task of tasks) {
    if (task.id === id) {
      if (title !== undefined) {
        if (title.trim() === "") {
          return res.status(400).json({
            message: "Bad Request: Empty/Invalid body",
          });
        }
        task.title = title;
      }
      if (mark_as_done !== undefined) {
        task.mark_as_done = mark_as_done;
      }
      return res.status(200).json(task);
    }
  }

  res.status(404).json({
    message: `Task ${id} not found`,
  });
});

// delete a specific task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  let task_idx = null;
  for (const task of tasks) {
    if (task.id === id) {
      task_idx = tasks.indexOf(task);
      break;
    }
  }

  if (task_idx > -1) {
    tasks.splice(task_idx, 1);
    return res.status(204).json({});
  }

  res.status(404).json({
    message: `Task ${id} not found`,
  });
});

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
