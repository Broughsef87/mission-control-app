-- Migration: Add status column to projects, content, and goals

-- Add status column to projects
ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'parked', 'archived'));

-- Add status column to content
ALTER TABLE content ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'parked', 'archived'));

-- Add status column to goals
ALTER TABLE goals ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'parked', 'archived'));

-- Migrate existing DS rows to parked (Dad Strength App)
UPDATE projects SET status = 'parked' WHERE name ILIKE '%Dad Strength%';
UPDATE content SET status = 'parked' WHERE title ILIKE '%Dad Strength%' OR title ILIKE '%Nap-Squeeze%';
UPDATE goals SET status = 'parked' WHERE title ILIKE '%Dad Strength%';
