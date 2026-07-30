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

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

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

app.post("/tasks", (req, res) => {
  const title = req.body.title;

  // if title is empty
  if (!title) {
    return res.status(400).json({
      message: "Bad Request, title can't be empty",
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

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    verson: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});
