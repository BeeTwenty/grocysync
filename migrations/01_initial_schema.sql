
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(id),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  quantity INTEGER,
  unit TEXT,
  added_by TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_by TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create keyword_categories table
CREATE TABLE IF NOT EXISTS keyword_categories (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id)
);

-- Add unique constraint on keyword-category pair
CREATE UNIQUE INDEX IF NOT EXISTS keyword_category_unique_idx ON keyword_categories (keyword, category_id);

-- Seed default categories
INSERT INTO categories (id, name, icon, color)
VALUES
  ('produce', 'Produce', 'leaf', 'green'),
  ('dairy', 'Dairy', 'milk', 'blue'),
  ('meat', 'Meat', 'beef', 'red'),
  ('bakery', 'Bakery', 'croissant', 'yellow'),
  ('frozen', 'Frozen', 'snowflake', 'cyan'),
  ('pantry', 'Pantry', 'package', 'brown'),
  ('beverages', 'Beverages', 'coffee', 'orange'),
  ('household', 'Household', 'home', 'purple'),
  ('other', 'Other', 'shopping-basket', 'gray'),
  ('unknown', 'Uncategorized', 'help-circle', 'gray')
ON CONFLICT (id) DO NOTHING;
