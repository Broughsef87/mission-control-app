-- Migration: Add visibility column to projects, content_items, and goals
-- Uses a separate `visibility` column (not `status`) to avoid conflicting with
-- existing workflow status columns and app values like 'In Progress'/'backlog'.

ALTER TABLE projects    ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'active' CHECK (visibility IN ('active', 'parked', 'archived'));
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'active' CHECK (visibility IN ('active', 'parked', 'archived'));
ALTER TABLE goals       ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'active' CHECK (visibility IN ('active', 'parked', 'archived'));

-- Migrate existing Dad Strength rows to parked
UPDATE projects       SET visibility = 'parked' WHERE name  ILIKE '%Dad Strength%';
UPDATE content_items  SET visibility = 'parked' WHERE title ILIKE '%Dad Strength%' OR title ILIKE '%Nap-Squeeze%';
UPDATE goals          SET visibility = 'parked' WHERE title ILIKE '%Dad Strength%';
