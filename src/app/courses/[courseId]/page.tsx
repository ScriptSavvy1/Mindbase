"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  Users,
  Globe,
  BarChart3,
  Award,
  Download,
  Infinity,
  Monitor,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { CurriculumAccordion } from "@/components/course/CurriculumAccordion";
import { InstructorCard } from "@/components/course/InstructorCard";
import { ReviewCard } from "@/components/course/ReviewCard";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Course, Module, Lesson, Review } from "@/types";

// Sample data for demo
const sampleCourse: Course = {
  id: "1",
  title: "Large Language Models in Production: From RAG to Finetuning",
  description:
    "Master the deployment of LLMs. Build robust RAG pipelines, optimize latency with vLLM, and learn to finetune Llama-3 for specialized domain tasks.",
  category: "ai",
  skill_level: "intermediate",
  price: 14900,
  original_price: 24900,
  instructor_id: "1",
  status: "approved",
  thumbnail_url: null,
  total_duration: "24.5 hours",
  total_lessons: 128,
  total_students: 34201,
  average_rating: 4.9,
  total_reviews: 2400,
  learning_outcomes: [
    "Architect production-grade RAG systems using Pinecone and LangChain",
    "Implement efficient LLM orchestration with FastAPI and Docker",
    "Finetune Llama-3 using QLoRA for domain-specific knowledge",
    "Master prompt engineering techniques: CoT, ReAct, and Few-shot",
    "Optimize inference speeds using vLLM and NVIDIA Triton",
    "Build robust evaluation frameworks for model safety and bias",
  ],
  language: "English [CC]",
  created_at: "",
  updated_at: "",
  instructor: {
    id: "1",
    name: "Dr. Aris Thorne",
    email: "",
    role: "instructor",
    avatar_url: null,
    bio: "With over 15 years in Machine Learning and a PhD from Stanford, Aris has built large-scale AI infrastructure for Fortune 500 companies. He currently leads the LLM Deployment group at Neurix, specializing in low-latency inference and secure on-premise model hosting.",
    title: "Lead AI Research Scientist",
    company: "Neurix Systems",
    created_at: "",
  },
};

const sampleModules: (Module & { lessons: Lesson[] })[] = [
  {
    id: "m1",
    course_id: "1",
    title: "Foundation of Modern LLMs",
    description:
      "Introduction to Transformer architecture and Attention mechanisms.",
    order: 1,
    created_at: "",
    lessons: [
      { id: "l1", module_id: "m1", course_id: "1", title: "The History of NLP: From RNNs to GPT", video_url: null, duration: "12:45", order: 1, is_free_preview: true, created_at: "" },
      { id: "l2", module_id: "m1", course_id: "1", title: "Understanding Self-Attention in 10 Minutes", video_url: null, duration: "09:20", order: 2, is_free_preview: true, created_at: "" },
      { id: "l3", module_id: "m1", course_id: "1", title: "Setting up your Python environment with Conda", video_url: null, duration: "15:10", order: 3, is_free_preview: false, created_at: "" },
      { id: "l4", module_id: "m1", course_id: "1", title: "HuggingFace Hub: The GitHub of AI", video_url: null, duration: "23:30", order: 4, is_free_preview: false, created_at: "" },
    ],
  },
  {
    id: "m2",
    course_id: "1",
    title: "Vector Databases & RAG Pipelines",
    description:
      "Retrieval Augmented Generation using Pinecone, Weaviate, and Milvus.",
    order: 2,
    created_at: "",
    lessons: [
      { id: "l5", module_id: "m2", course_id: "1", title: "What is RAG and Why Does it Matter?", video_url: null, duration: "14:20", order: 1, is_free_preview: false, created_at: "" },
      { id: "l6", module_id: "m2", course_id: "1", title: "Building your first Pinecone index", video_url: null, duration: "28:15", order: 2, is_free_preview: false, created_at: "" },
      { id: "l7", module_id: "m2", course_id: "1", title: "Advanced chunking strategies", video_url: null, duration: "19:40", order: 3, is_free_preview: false, created_at: "" },
    ],
  },
  {
    id: "m3",
    course_id: "1",
    title: "Advanced Finetuning with QLoRA",
    description:
      "Quantization and Low-Rank Adaptation for consumer GPUs.",
    order: 3,
    created_at: "",
    lessons: [
      { id: "l8", module_id: "m3", course_id: "1", title: "Understanding LoRA and QLoRA", video_url: null, duration: "22:10", order: 1, is_free_preview: false, created_at: "" },
      { id: "l9", module_id: "m3", course_id: "1", title: "Preparing training data for finetuning", video_url: null, duration: "18:55", order: 2, is_free_preview: false, created_at: "" },
    ],
  },
];

const sampleReviews: Review[] = [
  {
    id: "r1", course_id: "1", user_id: "u1", user_name: "Sarah Jenkins",
    user_avatar: null, rating: 5, created_at: "2024-11-15T00:00:00Z",
    comment: "The section on vLLM optimization alone saved our team months of R&D. Aris explains complex latency bottlenecks with perfect clarity.",
  },
  {
    id: "r2", course_id: "1", user_id: "u2", user_name: "Markus Weber",
    user_avatar: null, rating: 5, created_at: "2024-11-10T00:00:00Z",
    comment: "Best technical course I've taken. It goes beyond the basic tutorials you find on YouTube and actually addresses production issues.",
  },
  {
    id: "r3", course_id: "1", user_id: "u3", user_name: "Anya Petrov",
    user_avatar: null, rating: 4, created_at: "2024-10-28T00:00:00Z",
    comment: "I transitioned from Web Dev to AI using this series. The roadmap is structured logically and the hands-on labs are excellent.",
  },
];

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course>(sampleCourse);
  const [modules, setModules] = useState(sampleModules);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        // Fetch course
        const { data: courseData } = await supabase
          .from("courses")
          .select("*, instructor:profiles!instructor_id(*)")
          .eq("id", courseId)
          .single();

        if (courseData) setCourse(courseData as Course);

        // Fetch modules + lessons
        const { data: modulesData } = await supabase
          .from("modules")
          .select("*, lessons(*)")
          .eq("course_id", courseId)
          .order("order", { ascending: true });

        if (modulesData && modulesData.length > 0) {
          setModules(
            modulesData.map((m: any) => ({
              ...m,
              lessons: (m.lessons || []).sort(
                (a: any, b: any) => a.order - b.order
              ),
            }))
          );
        }

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })
          .limit(6);

        if (reviewsData && reviewsData.length > 0) setReviews(reviewsData);

        // Check enrollment
        if (user) {
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .single();

          setIsEnrolled(!!enrollment);
        }
      } catch {
        // Use sample data
      }
    }
    load();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/courses/${courseId}`;
      return;
    }

    setEnrolling(true);
    try {
      const supabase = createClient();
      await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        progress: 0,
        completed_lessons: [],
      });
      setIsEnrolled(true);
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
    setEnrolling(false);
  };

  const categoryLabels: Record<string, string> = {
    ai: "AI Engineering",
    fintech: "Fintech",
    other: "Other Tech",
  };

  const discount =
    course.original_price && course.original_price > course.price
      ? Math.round(
          ((course.original_price - course.price) / course.original_price) * 100
        )
      : null;

  return (
    <div className="min-h-screen pt-16">
      {/* Header Area */}
      <section className="bg-bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge category={course.category}>
                  {categoryLabels[course.category]}
                </Badge>
                <StarRating
                  rating={course.average_rating}
                  count={course.total_reviews}
                  size="md"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {course.title}
              </h1>

              <p className="text-text-secondary leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-4 flex-wrap text-sm">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-secondary">
                  <BarChart3 className="w-4 h-4" />
                  Level: {course.skill_level}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-secondary">
                  <Clock className="w-4 h-4" />
                  Duration: {course.total_duration}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-secondary">
                  <Users className="w-4 h-4" />
                  {course.total_students?.toLocaleString()} Students
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-secondary">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </span>
              </div>

              {/* Video Preview */}
              <div className="relative aspect-video bg-bg-card border border-border rounded-xl overflow-hidden group mt-6">
                <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated to-bg-card flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors cursor-pointer">
                    <Play className="w-8 h-8 text-accent ml-1" />
                  </div>
                  <p className="absolute bottom-6 text-sm text-text-muted font-medium tracking-wider uppercase">
                    Preview this course
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Pricing Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-bg-card border border-border rounded-xl p-6 space-y-5">
                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {course.price === 0
                      ? "Free"
                      : `$${(course.price / 100).toFixed(2)}`}
                  </span>
                  {course.original_price &&
                    course.original_price > course.price && (
                      <>
                        <span className="text-lg text-text-muted line-through">
                          ${(course.original_price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-success">
                          {discount}% OFF
                        </span>
                      </>
                    )}
                </div>

                {isEnrolled ? (
                  <Link href={`/learn/${courseId}`}>
                    <Button variant="primary" size="lg" className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleEnroll}
                    loading={enrolling}
                  >
                    Enroll Now
                  </Button>
                )}

                <Button variant="secondary" size="md" className="w-full">
                  Try Free Preview
                </Button>

                {/* Course Includes */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    This course includes
                  </p>
                  {[
                    { icon: Clock, text: `${course.total_duration} on-demand video` },
                    { icon: Award, text: "Certificate of completion" },
                    { icon: Download, text: "14 downloadable resources" },
                    { icon: Infinity, text: "Full lifetime access" },
                    { icon: Monitor, text: "Access on mobile and TV" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <item.icon className="w-4 h-4 text-accent" />
                      {item.text}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 pt-3 border-t border-border">
                  <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" />
                    Share this course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* What you'll learn */}
        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
          <section className="bg-bg-card border border-border rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">What you&apos;ll learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.learning_outcomes.map((outcome, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary leading-relaxed">
                    {outcome}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curriculum */}
        <section>
          <CurriculumAccordion
            modules={modules}
            isEnrolled={isEnrolled}
            onLessonClick={(lessonId) => {
              if (isEnrolled) {
                window.location.href = `/learn/${courseId}?lesson=${lessonId}`;
              }
            }}
          />
        </section>

        {/* Instructor */}
        {course.instructor && (
          <section>
            <InstructorCard
              instructor={course.instructor}
              stats={{
                rating: course.average_rating,
                totalReviews: course.total_reviews,
                totalStudents: course.total_students,
                totalCourses: 12,
              }}
            />
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Learner Reviews</h2>
              <button className="text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer">
                See all reviews
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
