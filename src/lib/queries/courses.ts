import { createClient } from "@/lib/supabase/client";
import type { Course, CourseFilters } from "@/types";

const supabase = createClient();

export async function getCourses(filters: CourseFilters = {}) {
  let query = supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(*)")
    .eq("status", "approved");

  // Category filter
  if (filters.category && filters.category.length > 0) {
    query = query.in("category", filters.category);
  }

  // Skill level filter
  if (filters.skillLevel && filters.skillLevel.length > 0) {
    query = query.in("skill_level", filters.skillLevel);
  }

  // Price type filter
  if (filters.priceType === "free") {
    query = query.eq("price", 0);
  } else if (filters.priceType === "paid") {
    query = query.gt("price", 0);
  }

  // Search
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  // Sorting
  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    case "popular":
    default:
      query = query.order("total_students", { ascending: false });
      break;
  }

  // Pagination
  const limit = filters.limit || 9;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { courses: (data as Course[]) || [], count };
}

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(*)")
    .eq("id", courseId)
    .single();

  if (error) throw error;
  return data as Course;
}

export async function getCourseModules(courseId: string) {
  const { data, error } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  if (error) throw error;

  // Sort lessons within each module
  return (data || []).map((mod: any) => ({
    ...mod,
    lessons: (mod.lessons || []).sort(
      (a: any, b: any) => a.order - b.order
    ),
  }));
}

export async function getCourseReviews(courseId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

export async function getFeaturedCourses(category?: string) {
  let query = supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(*)")
    .eq("status", "approved")
    .order("total_students", { ascending: false })
    .limit(6);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Course[]) || [];
}

export async function getInstructors() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "instructor")
    .limit(5);

  if (error) throw error;
  return data || [];
}
