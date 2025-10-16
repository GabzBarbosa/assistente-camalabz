-- Add completed_at column to tasks table to track completion time
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);