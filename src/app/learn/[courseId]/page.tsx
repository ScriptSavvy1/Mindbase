"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { LessonSidebar } from "@/components/player/LessonSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Module, Lesson, Enrollment } from "@/types";

// Sample data
const sampleModules: (Module & { lessons: Lesson[] })[] = [
  {
    id: "m1", course_id: "1", title: "Fintech Architecture", description: null,
    order: 1, created_at: "",
    lessons: [
      { id: "l1", module_id: "m1", course_id: "1", title: "Introduction to Core Banking", video_url: null, duration: "08:20", order: 1, is_free_preview: true, created_at: "" },
      { id: "l2", module_id: "m1", course_id: "1", title: "Ledger Systems & Double Entry", video_url: null, duration: "15:45", order: 2, is_free_preview: false, created_at: "" },
      { id: "l3", module_id: "m1", course_id: "1", title: "Scalable Payment Gateways", video_url: null, duration: "24:30", order: 3, is_free_preview: false, created_at: "" },
      { id: "l4", module_id: "m1", course_id: "1", title: "Handling Concurrent Transactions", video_url: null, duration: "12:10", order: 4, is_free_preview: false, created_at: "" },
    ],
  },
  {
    id: "m2", course_id: "1", title: "Compliance & Security", description: null,
    order: 2, created_at: "",
    lessons: [
      { id: "l5", module_id: "m2", course_id: "1", title: "KYC/AML Fundamentals", video_url: null, duration: "18:20", order: 1, is_free_preview: false, created_at: "" },
      { id: "l6", module_id: "m2", course_id: "1", title: "PCI DSS Compliance for Developers", video_url: null, duration: "22:15", order: 2, is_free_preview: false, created_at: "" },
    ],
  },
];

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modules, setModules] = useState(sampleModules);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [courseName, setCourseName] = useState("Zero to Fintech Engineer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Flatten all lessons
  const allLessons = useMemo(
    () => modules.flatMap((m) => m.lessons || []),
    [modules]
  );

  // Current lesson
  const initialLessonId = searchParams.get("lesson") || allLessons[0]?.id || "";
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);

  const currentLesson = allLessons.find((l) => l.id === currentLessonId) || allLessons[0];
  const currentModule = modules.find((m) => m.id === currentLesson?.module_id);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;
  const progress = allLessons.length > 0
    ? Math.round((completedLessons.length / allLessons.length) * 100)
    : 0;

  useEffect(() => {
    async function load() {
      if (!user) {
        router.push(`/login?redirect=/learn/${courseId}`);
        return;
      }

      try {
        const supabase = createClient();

        // Check enrollment
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();

        if (!enrollmentData) {
          router.push(`/courses/${courseId}`);
          return;
        }

        setEnrollment(enrollmentData as Enrollment);
        setCompletedLessons(enrollmentData.completed_lessons || []);

        // Fetch course name
        const { data: courseData } = await supabase
          .from("courses")
          .select("title")
          .eq("id", courseId)
          .single();

        if (courseData) setCourseName(courseData.title);

        // Fetch modules + lessons
        const { data: modulesData } = await supabase
          .from("modules")
          .select("*, lessons(*)")
          .eq("course_id", courseId)
          .order("order", { ascending: true });

        if (modulesData && modulesData.length > 0) {
          const sorted = modulesData.map((m: any) => ({
            ...m,
            lessons: (m.lessons || []).sort((a: any, b: any) => a.order - b.order),
          }));
          setModules(sorted);

          // Set current lesson to last accessed or first
          const flatLessons = sorted.flatMap((m: any) => m.lessons || []);
          if (enrollmentData.last_lesson_id) {
            setCurrentLessonId(enrollmentData.last_lesson_id);
          } else if (flatLessons.length > 0) {
            setCurrentLessonId(flatLessons[0].id);
          }
        }
      } catch {
        // Use sample data
      }
      setLoading(false);
    }
    load();
  }, [courseId, user, router]);

  const handleMarkComplete = async () => {
    if (!currentLesson || completedLessons.includes(currentLesson.id)) return;

    const newCompleted = [...completedLessons, currentLesson.id];
    setCompletedLessons(newCompleted);

    if (enrollment) {
      try {
        const supabase = createClient();
        const newProgress = Math.round((newCompleted.length / allLessons.length) * 100);
        await supabase
          .from("enrollments")
          .update({
            completed_lessons: newCompleted,
            progress: Math.min(newProgress, 100),
            last_lesson_id: currentLesson.id,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", enrollment.id);
      } catch {
        // Ignore errors
      }
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-secondary">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Link href={`/courses/${courseId}`} className="hover:text-accent transition-colors">
                {courseName}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-text-secondary">{currentModule?.title}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-accent">
                Lesson {currentLessonIndex + 1}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">Course Progress</span>
                <div className="w-32">
                  <ProgressBar progress={progress} size="sm" showLabel={false} />
                </div>
                <span className="text-xs font-medium text-accent">{progress}%</span>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 hover:bg-bg-hover rounded cursor-pointer"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Lesson Title */}
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-bold">{currentLesson?.title}</h1>
          </div>

          {/* Video Player */}
          <div className="px-6 pb-6">
            <VideoPlayer
              videoUrl={currentLesson?.video_url || null}
              title={currentLesson?.title || ""}
              onEnded={handleMarkComplete}
            />
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <BookOpen className="w-4 h-4" />
                Resources
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleMarkComplete}
                disabled={completedLessons.includes(currentLesson?.id || "")}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedLessons.includes(currentLesson?.id || "")
                  ? "Completed"
                  : "Mark as Complete"}
              </Button>
              {nextLesson && (
                <Button variant="primary" size="md" onClick={handleNextLesson}>
                  Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Lesson Notes */}
          <div className="px-6 pb-12 border-t border-border pt-6">
            <h2 className="text-lg font-bold mb-3">Lesson Notes</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              In this lesson, we dive deep into the architecture required to
              handle high-frequency transactions. We&apos;ll cover the
              &apos;Idempotency Key&apos; pattern, which ensures that retrying a
              failed request doesn&apos;t result in double-charging a customer.
              Pay close attention to the database transaction isolation levels we
              discuss.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`w-80 flex-shrink-0 transition-all duration-300 ${
            sidebarOpen
              ? "translate-x-0"
              : "translate-x-full absolute right-0 top-16 bottom-0 lg:relative lg:translate-x-0"
          }`}
        >
          <LessonSidebar
            modules={modules}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            totalLessons={allLessons.length}
            completedCount={completedLessons.length}
            onLessonSelect={(id) => setCurrentLessonId(id)}
          />
        </div>
      </div>
    </div>
  );
}
