-- Migration: Fix notifications RLS policy
-- Run this file in Supabase SQL Editor

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

-- Create a more permissive insert policy
-- Users can create notifications for any user (specifically for comment notifications)
CREATE POLICY "Users can create notifications for others" ON notifications 
FOR INSERT 
WITH CHECK (
  auth.uid() = from_user_id
);
