-- Create planning_items table for agile ceremonies management
CREATE TABLE public.planning_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'sprint', 'refinement', 'review', 'planning')),
  date DATE NOT NULL,
  duration INTEGER DEFAULT 30,
  participants TEXT[],
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.planning_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own planning items" 
ON public.planning_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planning items" 
ON public.planning_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning items" 
ON public.planning_items 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planning items" 
ON public.planning_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planning_items_updated_at
    BEFORE UPDATE ON public.planning_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();