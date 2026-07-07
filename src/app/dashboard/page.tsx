"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Download,
  Share2,
  ArrowRight,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Enrollment, Course } from "@/types";

// Sample data
const sampleEnrollments = [
  {
    id: "e1", user_id: "u1", course_id: "c1", progress: 65, completed_lessons: [], last_lesson_id: null,
    last_accessed_at: new Date().toISOString(), purchased_at: "2024-01-01",
    course: {
      id: "c1", title: "Advanced Neural Networks for Finance", description: "",
      category: "ai", skill_level: "advanced", price: 19900, original_price: null,
      instructor_id: "i1", status: "approved", thumbnail_url: null, total_duration: "24h",
      total_lessons: 24, total_students: 1200, average_rating: 4.9, total_reviews: 180,
      learning_outcomes: [], language: "English", created_at: "", updated_at: "",
      instructor: { id: "i1", name: "Dr. Aris Thorne", email: "", role: "instructor", avatar_url: null, bio: null, title: null, company: null, created_at: "" },
    },
  },
  {
    id: "e2", user_id: "u1", course_id: "c2", progress: 32, completed_lessons: [], last_lesson_id: null,
    last_accessed_at: new Date(Date.now() - 86400000).toISOString(), purchased_at: "2024-02-01",
    course: {
      id: "c2", title: "Smart Contract Security Audit Masterclass", description: "",
      category: "fintech", skill_level: "intermediate", price: 14900, original_price: null,
      instructor_id: "i2", status: "approved", thumbnail_url: null, total_duration: "18h",
      total_lessons: 18, total_students: 890, average_rating: 4.7, total_reviews: 120,
      learning_outcomes: [], language: "English", created_at: "", updated_at: "",
      instructor: { id: "i2", name: "Sarah Chen", email: "", role: "instructor", avatar_url: null, bio: null, title: null, company: null, created_at: "" },
    },
  },
  {
    id: "e3", user_id: "u1", course_id: "c3", progress: 100, completed_lessons: [], last_lesson_id: null,
    last_accessed_at: new Date(Date.now() - 172800000).toISOString(), purchased_at: "2023-12-01",
    course: {
      id: "c3", title: "Quantitative Trading with Python", description: "",
      category: "fintech", skill_level: "beginner", price: 9900, original_price: null,
      instructor_id: "i3", status: "approved", thumbnail_url: null, total_duration: "12h",
      total_lessons: 42, total_students: 3200, average_rating: 4.8, total_reviews: 450,
      learning_outcomes: [], language: "English", created_at: "", updated_at: "",
      instructor: { id: "i3", name: "Markus Volkov", email: "", role: "instructor", avatar_url: null, bio: null, title: null, company: null, created_at: "" },
    },
  },
];

export default function LearnerDashboard() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>(sampleEnrollments);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("enrollments")
          .select("*, course:courses(*, instructor:profiles!instructor_id(*))")
          .eq("user_id", user.id)
          .order("last_accessed_at", { ascending: false, nullsFirst: false });

        if (data && data.length > 0) setEnrollments(data);
      } catch {}
    }
    load();
  }, [user]);

  const activeEnrollments = enrollments.filter((e) => e.progress < 100);
  const completedEnrollments = enrollments.filter((e) => e.progress >= 100);
  const currentCourse = activeEnrollments[0];

  const filteredEnrollments =
    filter === "active"
      ? activeEnrollments
      : filter === "completed"
      ? completedEnrollments
      : enrollments;

  const totalHours = enrollments.length * 20; // Rough estimate

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border min-h-[calc(100vh-4rem)] p-4 gap-1">
          {[
            { icon: BookOpen, label: "My Learning", href: "/dashboard", active: true },
            { icon: BookOpen, label: "Catalog", href: "/courses" },
            { icon: Settings, label: "Settings", href: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 p-6 lg:p-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Learner Dashboard</h1>
              <p className="text-text-secondary text-sm mt-1">
                Welcome back, {profile?.name || "Learner"}. Keep it up!
              </p>
            </div>
            <div className="bg-bg-card border border-border rounded-xl px-5 py-3 text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">
                Total Learning Time
              </p>
              <p className="text-xl font-bold mt-0.5">{totalHours}h</p>
            </div>
          </div>

          {/* Continue Learning */}
          {currentCourse && (
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-accent rounded-full" />
                Continue Learning
              </h2>
              <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-72 aspect-video md:aspect-auto bg-gradient-to-br from-bg-elevated to-bg-card flex items-center justify-center">
                    <span className="text-4xl font-bold text-text-muted/20">
                      {currentCourse.course.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="status" category="approved">
                          In Progress
                        </Badge>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 2h 45m left
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">
                        {currentCourse.course.title}
                      </h3>
                      <p className="text-sm text-text-muted mt-1">
                        Current Module: Module {Math.ceil(currentCourse.progress / 25)}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                        <span>Overall Progress</span>
                        <span className="text-accent font-medium">
                          {currentCourse.progress}%
                        </span>
                      </div>
                      <ProgressBar
                        progress={currentCourse.progress}
                        size="md"
                        showLabel={false}
                      />
                      <div className="mt-4 flex justify-end">
                        <Link href={`/learn/${currentCourse.course_id}`}>
                          <Button variant="primary" size="md">
                            Resume Lesson
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Your Courses */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Your Courses
              </h2>
              <div className="flex gap-1">
                {(["all", "active", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                      filter === f
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {filteredEnrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/learn/${enrollment.course_id}`}
                  className="bg-bg-card border border-border rounded-xl overflow-hidden card-hover group"
                >
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-bg-elevated to-bg-card flex items-center justify-center">
                    <span className="text-3xl font-bold text-text-muted/20">
                      {enrollment.course.title.charAt(0)}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-bg-primary/80 rounded text-[10px] font-medium text-text-secondary">
                      {enrollment.course.total_lessons} Lessons
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
                        {enrollment.course.instructor?.name?.charAt(0) || "?"}
                      </div>
                      <span className="text-xs text-text-muted">
                        {enrollment.course.instructor?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <ProgressBar
                        progress={enrollment.progress}
                        size="sm"
                        showLabel={false}
                        className="flex-1 mr-3"
                      />
                      <span className="text-xs text-text-muted">
                        {enrollment.progress}% Complete
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {enrollment.progress >= 100 ? "Finished" : "Learning"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Certificates */}
          {completedEnrollments.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5" /> Certificates
                </h2>
                <button className="text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer">
                  View all <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {enrollment.course.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        Issued{" "}
                        {new Date(enrollment.purchased_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="p-1.5 hover:bg-bg-hover rounded transition-colors cursor-pointer">
                        <Download className="w-4 h-4 text-text-muted" />
                      </button>
                      <button className="p-1.5 hover:bg-bg-hover rounded transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Next Steps */}
          <section>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" /> Next Steps
            </h2>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-text-secondary mb-4">
                Based on your interest in <strong>Fintech</strong> and{" "}
                <strong>AI Models</strong>:
              </p>
              <div className="space-y-3">
                {[
                  "Deep Reinforcement Learning",
                  "Asset Tokenization Strategies",
                  "Rust for High Performance Computing",
                ].map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Badge category={i === 0 ? "ai" : i === 1 ? "fintech" : "other"}>
                        {i === 0 ? "AI" : i === 1 ? "Fintech" : "Systems"}
                      </Badge>
                      <span className="text-sm">{rec}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                ))}
              </div>
              <Link href="/courses" className="block mt-4">
                <Button variant="secondary" size="md" className="w-full">
                  Explore Full Catalog
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
