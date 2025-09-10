-- Add recurrence fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
ADD COLUMN recurrence_type text NULL, -- daily, weekly, monthly, yearly
ADD COLUMN recurrence_interval integer NULL DEFAULT 1, -- every X days/weeks/months
ADD COLUMN recurrence_end_date date NULL,
ADD COLUMN recurrence_days_of_week integer[] NULL, -- [0,1,2,3,4,5,6] for weekly
ADD COLUMN recurrence_day_of_month integer NULL, -- for monthly
ADD COLUMN next_occurrence_date date NULL;