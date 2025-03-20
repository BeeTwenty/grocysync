
-- This is a template script for importing data from your Supabase export
-- You will need to customize this based on your actual exported data

-- Import categories
INSERT INTO categories (id, name, icon, color)
SELECT id, name, icon, color
FROM supabase_categories_export
ON CONFLICT (id) DO NOTHING;

-- Import keyword_categories
INSERT INTO keyword_categories (keyword, category_id)
SELECT keyword, category_id
FROM supabase_keyword_categories_export
ON CONFLICT DO NOTHING;

-- Add any user you want to keep
INSERT INTO users (id, email, password, created_at, updated_at)
VALUES 
  ('your-user-id-from-supabase', 'your-email@example.com', 'you-will-need-to-reset-password', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Import profiles
INSERT INTO profiles (user_id, display_name, email, created_at, updated_at)
SELECT user_id, display_name, email, created_at, updated_at
FROM supabase_profiles_export
ON CONFLICT (user_id) DO NOTHING;

-- Import items
INSERT INTO items (id, name, category, completed, quantity, unit, added_by, added_at, completed_by, completed_at)
SELECT id, name, category, completed, quantity, unit, added_by, added_at, completed_by, completed_at
FROM supabase_items_export
ON CONFLICT (id) DO NOTHING;

-- Note: You'll need to modify the actual table names to match your Supabase export structure
-- This is just a template to help you structure your import
