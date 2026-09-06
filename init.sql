-- PostgreSQL initialization script for tasks_db
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for status filtering and search performance
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);

-- seed initial default tasks if table is empty
INSERT INTO tasks (title, completed)
SELECT 'Review project requirements and set up the initial workflow', false
WHERE NOT EXISTS (SELECT 1 FROM tasks);

INSERT INTO tasks (title, completed)
SELECT 'Prepare deployment scripts and documentation', false
WHERE (SELECT COUNT(*) FROM tasks) = 1;

INSERT INTO tasks (title, completed)
SELECT 'Deploy the application to production', false
WHERE (SELECT COUNT(*) FROM tasks) = 2;
