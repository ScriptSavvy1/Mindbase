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
  MessageCircle,
  Phone,
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

const WHATSAPP_NUMBER = "25472929631";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

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

        if (modulesData) {
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

        if (reviewsData) setReviews(reviewsData);

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
        // Course not found or Supabase error
      }
      setLoading(false);
    }
    load();
  }, [courseId, user]);

  const categoryLabels: Record<string, string> = {
    ai: "AI Engineering",
    fintech: "Fintech",
    other: "Other Tech",
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Course not found state
  if (!course) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <p className="text-text-secondary mb-6">
          This course may have been removed or doesn&apos;t exist.
        </p>
        <Link href="/courses">
          <Button variant="primary" size="md">
            Browse All Courses
          </Button>
        </Link>
      </div>
    );
  }

  const discount =
    course.original_price && course.original_price > course.price
      ? Math.round(
          ((course.original_price - course.price) / course.original_price) * 100
        )
      : null;

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the course: "${course.title}" on Mindbase Academy. I'd like to learn more about enrollment and payment options.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const scheduleMessage = encodeURIComponent(
    `Hi, I'd like to schedule a call to discuss the course: "${course.title}" on Mindbase Academy.`
  );
  const scheduleUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${scheduleMessage}`;

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
                {course.total_reviews > 0 && (
                  <StarRating
                    rating={course.average_rating}
                    count={course.total_reviews}
                    size="md"
                  />
                )}
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
                {course.total_duration && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-secondary">
                    <Clock className="w-4 h-4" />
                    Duration: {course.total_duration}
                  </span>
                )}
                {course.total_students > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-text-secondary">
                    <Users className="w-4 h-4" />
                    {course.total_students?.toLocaleString()} Students
                  </span>
                )}
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
                  <div className="space-y-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all"
                      style={{ backgroundColor: "#25D366" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1ebe57")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#25D366")
                      }
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message on WhatsApp
                    </a>

                    <a
                      href={scheduleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-elevated border border-border rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-hover hover:border-border-hover transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Schedule a Call
                    </a>
                  </div>
                )}

                {/* Course Includes */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    This course includes
                  </p>
                  {[
                    {
                      icon: Clock,
                      text: `${course.total_duration || "On-demand"} video`,
                    },
                    { icon: Award, text: "Certificate of completion" },
                    { icon: Download, text: "Downloadable resources" },
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
        {modules.length > 0 && (
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
        )}

        {/* Instructor */}
        {course.instructor && (
          <section>
            <InstructorCard
              instructor={course.instructor}
              stats={{
                rating: course.average_rating,
                totalReviews: course.total_reviews,
                totalStudents: course.total_students,
                totalCourses: 1,
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
