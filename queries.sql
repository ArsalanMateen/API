-- Stage 4: Learn your first SQL by hand
-- Run directly against tasks.db in DB Browser for SQLite

-- 1. List every task
SELECT * FROM tasks;

-- 2. List only completed tasks
SELECT * FROM tasks WHERE mark_as_done = 1;

-- 3. Count total tasks in the table
SELECT COUNT(*) FROM tasks;

-- 4. Mark every task completed
UPDATE tasks SET mark_as_done = 1;

-- 5. Delete all completed tasks
DELETE FROM tasks WHERE mark_as_done = 1;
