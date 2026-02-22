-- ============================================================
-- Hyderabad Traders - Schema Migration
-- Run this in Supabase SQL Editor to update existing tables
-- All changes are non-breaking (nullable columns / defaults)
-- ============================================================

-- =====================
-- BLOGS TABLE UPDATES
-- =====================

-- Add category column for blog categorization
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS category character varying DEFAULT NULL;

-- Add short description for blog cards/listings
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS description text DEFAULT NULL;

-- Add tags as text array for blog tagging
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add featured image URL for blog card thumbnails
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS featured_image_url text DEFAULT NULL;

-- =====================
-- COURSES TABLE UPDATES
-- =====================

-- Add category column for course categorization
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS category character varying DEFAULT NULL;

-- Add level column (Beginner, Intermediate, Advanced)
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS level character varying DEFAULT 'Beginner';

-- Add duration column (e.g., "40 hours", "12 weeks")
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS duration character varying DEFAULT NULL;

-- Add instructor name for display purposes
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS instructor_name character varying DEFAULT NULL;

-- =====================
-- CREATE INDEXES
-- =====================

-- Index for blog category filtering
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);

-- Index for blog published status + created_at (admin listing)
CREATE INDEX IF NOT EXISTS idx_blogs_published_created ON public.blogs(is_published, created_at DESC);

-- Index for course category filtering
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- Index for course level filtering
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);

-- Index for course active status (admin listing)
CREATE INDEX IF NOT EXISTS idx_courses_active_created ON public.courses(is_active, created_at DESC);
