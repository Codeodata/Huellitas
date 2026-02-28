-- Clear all data from database
-- WARNING: This will delete ALL data from your tables!

-- Delete in correct order (respecting foreign keys)
DELETE FROM notifications;
DELETE FROM comments;
DELETE FROM pets;
DELETE FROM posts;
DELETE FROM profiles;

-- Note: auth.users cannot be directly deleted
-- To reset auth users, you need to do it from Supabase Dashboard
-- Go to Authentication → Users → Delete users manually
