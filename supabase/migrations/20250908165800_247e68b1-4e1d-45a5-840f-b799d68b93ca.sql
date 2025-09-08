-- Add fields to tasks table for links and subtask functionality
ALTER TABLE public.tasks 
ADD COLUMN links TEXT[], 
ADD COLUMN parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create index for parent_id for better performance
CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_id);

-- Add updated_at trigger for tasks table if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();