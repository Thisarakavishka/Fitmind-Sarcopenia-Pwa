-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.exercise_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  target_muscle text,
  category text DEFAULT 'Strength'::text,
  video_url text,
  has_ai_model boolean DEFAULT false,
  ai_model_path text,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  muscle_group text,
  equipment text,
  ai_model_url text,
  CONSTRAINT exercise_library_pkey PRIMARY KEY (id)
);
CREATE TABLE public.food_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  protein_per_100g numeric NOT NULL,
  calories_per_100g numeric NOT NULL,
  is_omega3_rich boolean DEFAULT false,
  is_leucine_rich boolean DEFAULT false,
  category text,
  image_url text,
  CONSTRAINT food_library_pkey PRIMARY KEY (id)
);
CREATE TABLE public.meal_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  food_id uuid,
  food_name text NOT NULL,
  grams_consumed numeric NOT NULL,
  protein_earned numeric NOT NULL,
  calories_earned numeric NOT NULL,
  logged_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meal_logs_pkey PRIMARY KEY (id),
  CONSTRAINT meal_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT meal_logs_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.food_library(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  role text DEFAULT 'user'::text,
  avatar_url text,
  is_onboarded boolean DEFAULT false,
  age integer,
  weight_kg numeric,
  height_cm numeric,
  gender text,
  target_goal text,
  experience_level text,
  pain_level text,
  created_at timestamp with time zone DEFAULT now(),
  ai_plan_tag text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.session_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  order_index integer,
  target_sets integer,
  target_reps integer,
  CONSTRAINT session_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT session_exercises_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.workout_sessions(id),
  CONSTRAINT session_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercise_library(id)
);
CREATE TABLE public.template_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_id uuid,
  exercise_id uuid,
  day_number integer NOT NULL,
  target_sets integer DEFAULT 3,
  target_reps integer DEFAULT 12,
  order_index integer,
  CONSTRAINT template_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT template_exercises_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workout_templates(id),
  CONSTRAINT template_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercise_library(id)
);
CREATE TABLE public.workout_history_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_exercise_id uuid NOT NULL,
  date_completed timestamp with time zone DEFAULT now(),
  actual_sets_completed integer,
  actual_reps_completed integer,
  ai_form_accuracy_score numeric,
  user_feedback_score integer,
  CONSTRAINT workout_history_logs_pkey PRIMARY KEY (id),
  CONSTRAINT history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT history_session_exec_fkey FOREIGN KEY (session_exercise_id) REFERENCES public.session_exercises(id)
);
CREATE TABLE public.workout_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  ai_tag text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workout_plans_pkey PRIMARY KEY (id),
  CONSTRAINT workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workout_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  day_of_week text,
  focus_area text,
  scheduled_date date,
  is_completed boolean DEFAULT false,
  CONSTRAINT workout_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workout_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ai_tag text NOT NULL,
  focus text,
  intensity text DEFAULT 'Medium'::text,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workout_templates_pkey PRIMARY KEY (id)
);