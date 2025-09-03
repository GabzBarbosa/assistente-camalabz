-- Strengthen profiles table security by adding explicit policies
-- and ensuring no anonymous access is possible

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Create more restrictive policies that explicitly deny anonymous access
-- and ensure only authenticated users can access their own profiles

-- SELECT policy: Only authenticated users can view their own profile
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy: Only authenticated users can create their own profile
CREATE POLICY "Users can only create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Only authenticated users can update their own profile
CREATE POLICY "Users can only update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Only authenticated users can delete their own profile
CREATE POLICY "Users can only delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Explicitly deny all access to anonymous users
CREATE POLICY "Deny all access to anonymous users"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Add a comment to document the security measures
COMMENT ON TABLE public.profiles IS 'User profiles table with strict RLS policies - only authenticated users can access their own data';