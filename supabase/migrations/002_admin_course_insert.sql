-- ========================================
-- Mindbase Academy — Admin Course Insert Policy Fix
-- Run this in Supabase SQL Editor to update the
-- existing RLS policy so admins can post courses
-- assigned to any instructor.
-- ========================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Instructors can insert courses" ON courses;

-- Create new policy that lets admins insert courses with any instructor_id
CREATE POLICY "Instructors can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    (auth.uid() = instructor_id AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    ))
    OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
