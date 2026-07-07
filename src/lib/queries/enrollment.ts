import { createClient } from "@/lib/supabase/client";
import type { Enrollment } from "@/types";

const supabase = createClient();

export async function getEnrollment(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Enrollment | null;
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*, course:courses(*, instructor:profiles!instructor_id(*))")
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data || []) as (Enrollment & { course: any })[];
}

export async function createEnrollment(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      progress: 0,
      completed_lessons: [],
    })
    .select()
    .single();

  if (error) throw error;

  // Increment course student count
  try {
    await supabase.rpc("increment_students", { cid: courseId });
  } catch {
    // RPC may not exist yet, ignore
  }

  return data as Enrollment;
}

export async function markLessonComplete(
  enrollmentId: string,
  lessonId: string,
  totalLessons: number
) {
  // Get current enrollment
  const { data: enrollment, error: fetchError } = await supabase
    .from("enrollments")
    .select("completed_lessons")
    .eq("id", enrollmentId)
    .single();

  if (fetchError) throw fetchError;

  const completedLessons = enrollment.completed_lessons || [];
  if (completedLessons.includes(lessonId)) return;

  const updatedLessons = [...completedLessons, lessonId];
  const progress = Math.round((updatedLessons.length / totalLessons) * 100);

  const { error } = await supabase
    .from("enrollments")
    .update({
      completed_lessons: updatedLessons,
      progress: Math.min(progress, 100),
      last_lesson_id: lessonId,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId);

  if (error) throw error;
}

export async function updateLastAccessed(
  enrollmentId: string,
  lessonId: string
) {
  const { error } = await supabase
    .from("enrollments")
    .update({
      last_lesson_id: lessonId,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId);

  if (error) throw error;
}
