const express = require("express");
const app = express();
const port = 3000;

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
