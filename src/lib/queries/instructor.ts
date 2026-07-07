import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types";

const supabase = createClient();

export async function getInstructorCourses(instructorId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", instructorId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as Course[]) || [];
}

export async function getInstructorStats(instructorId: string) {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, total_students, average_rating, price, status")
    .eq("instructor_id", instructorId);

  if (error) throw error;

  const approvedCourses = (courses || []).filter((c) => c.status === "approved");
  const totalStudents = approvedCourses.reduce(
    (sum, c) => sum + (c.total_students || 0),
    0
  );
  const totalRevenue = approvedCourses.reduce(
    (sum, c) => sum + (c.total_students || 0) * (c.price || 0),
    0
  );
  const ratings = approvedCourses
    .filter((c) => c.average_rating > 0)
    .map((c) => c.average_rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  return {
    totalRevenue,
    totalStudents,
    activeCourses: approvedCourses.length,
    totalCourses: (courses || []).length,
    avgRating: Number(avgRating.toFixed(2)),
  };
}

export async function createCourse(courseData: Partial<Course>) {
  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function updateCourse(
  courseId: string,
  courseData: Partial<Course>
) {
  const { data, error } = await supabase
    .from("courses")
    .update({ ...courseData, updated_at: new Date().toISOString() })
    .eq("id", courseId)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) throw error;
}

export async function createModule(moduleData: {
  course_id: string;
  title: string;
  description?: string;
  order: number;
}) {
  const { data, error } = await supabase
    .from("modules")
    .insert(moduleData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createLesson(lessonData: {
  module_id: string;
  course_id: string;
  title: string;
  video_url?: string;
  duration?: string;
  order: number;
  is_free_preview?: boolean;
}) {
  const { data, error } = await supabase
    .from("lessons")
    .insert(lessonData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadFile(
  bucket: "thumbnails" | "videos",
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}
