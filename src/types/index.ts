// ──────────────────────────────────────────────
// Mindbase Academy — TypeScript Type Definitions
// ──────────────────────────────────────────────

export type UserRole = 'learner' | 'instructor' | 'pending_instructor' | 'admin';
export type CourseCategory = 'ai' | 'fintech' | 'other';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  title: string | null;
  company: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  skill_level: SkillLevel;
  price: number;
  original_price: number | null;
  instructor_id: string;
  status: CourseStatus;
  thumbnail_url: string | null;
  total_duration: string | null;
  total_lessons: number;
  total_students: number;
  average_rating: number;
  total_reviews: number;
  learning_outcomes: string[];
  language: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  instructor?: Profile;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  // Joined
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  duration: string | null;
  order: number;
  is_free_preview: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_lessons: string[];
  last_lesson_id: string | null;
  last_accessed_at: string | null;
  purchased_at: string;
  // Joined
  course?: Course;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CourseFilters {
  category?: CourseCategory[];
  skillLevel?: SkillLevel[];
  priceType?: 'free' | 'paid';
  search?: string;
  sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
  limit?: number;
  offset?: number;
}
