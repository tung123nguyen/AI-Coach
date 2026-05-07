-- Replace emoji column with image_situation (URL to cover image).

ALTER TABLE situations ADD COLUMN IF NOT EXISTS image_situation TEXT;
ALTER TABLE situations DROP COLUMN IF EXISTS emoji;
