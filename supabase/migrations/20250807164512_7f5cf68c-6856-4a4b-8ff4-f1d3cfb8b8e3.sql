-- Phase 1: Enable RLS and add strict user-scoped policies on all app tables
-- Benchmark Items
ALTER TABLE public.benchmark_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS benchmark_items_select_own ON public.benchmark_items;
DROP POLICY IF EXISTS benchmark_items_insert_own ON public.benchmark_items;
DROP POLICY IF EXISTS benchmark_items_update_own ON public.benchmark_items;
DROP POLICY IF EXISTS benchmark_items_delete_own ON public.benchmark_items;
CREATE POLICY benchmark_items_select_own ON public.benchmark_items
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY benchmark_items_insert_own ON public.benchmark_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY benchmark_items_update_own ON public.benchmark_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY benchmark_items_delete_own ON public.benchmark_items
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- CSD Items
ALTER TABLE public.csd_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS csd_items_select_own ON public.csd_items;
DROP POLICY IF EXISTS csd_items_insert_own ON public.csd_items;
DROP POLICY IF EXISTS csd_items_update_own ON public.csd_items;
DROP POLICY IF EXISTS csd_items_delete_own ON public.csd_items;
CREATE POLICY csd_items_select_own ON public.csd_items
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY csd_items_insert_own ON public.csd_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY csd_items_update_own ON public.csd_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY csd_items_delete_own ON public.csd_items
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS events_select_own ON public.events;
DROP POLICY IF EXISTS events_insert_own ON public.events;
DROP POLICY IF EXISTS events_update_own ON public.events;
DROP POLICY IF EXISTS events_delete_own ON public.events;
CREATE POLICY events_select_own ON public.events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY events_insert_own ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY events_update_own ON public.events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY events_delete_own ON public.events
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS projects_select_own ON public.projects;
DROP POLICY IF EXISTS projects_insert_own ON public.projects;
DROP POLICY IF EXISTS projects_update_own ON public.projects;
DROP POLICY IF EXISTS projects_delete_own ON public.projects;
CREATE POLICY projects_select_own ON public.projects
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY projects_insert_own ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY projects_update_own ON public.projects
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY projects_delete_own ON public.projects
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stories_select_own ON public.stories;
DROP POLICY IF EXISTS stories_insert_own ON public.stories;
DROP POLICY IF EXISTS stories_update_own ON public.stories;
DROP POLICY IF EXISTS stories_delete_own ON public.stories;
CREATE POLICY stories_select_own ON public.stories
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY stories_insert_own ON public.stories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY stories_update_own ON public.stories
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY stories_delete_own ON public.stories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tasks_select_own ON public.tasks;
DROP POLICY IF EXISTS tasks_insert_own ON public.tasks;
DROP POLICY IF EXISTS tasks_update_own ON public.tasks;
DROP POLICY IF EXISTS tasks_delete_own ON public.tasks;
CREATE POLICY tasks_select_own ON public.tasks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY tasks_insert_own ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_update_own ON public.tasks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_delete_own ON public.tasks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Timeline Items
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS timeline_items_select_own ON public.timeline_items;
DROP POLICY IF EXISTS timeline_items_insert_own ON public.timeline_items;
DROP POLICY IF EXISTS timeline_items_update_own ON public.timeline_items;
DROP POLICY IF EXISTS timeline_items_delete_own ON public.timeline_items;
CREATE POLICY timeline_items_select_own ON public.timeline_items
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY timeline_items_insert_own ON public.timeline_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY timeline_items_update_own ON public.timeline_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY timeline_items_delete_own ON public.timeline_items
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
