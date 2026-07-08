"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Star,
  Globe,
  ChevronRight,
  CheckCircle2,
  Zap,
  Award,
  Code2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import type { Course, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState("ai");
  const [stats, setStats] = useState({ learners: 0, courses: 0, instructors: 0 });
  const [topReview, setTopReview] = useState<{
    user_name: string;
    comment: string;
    rating: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // Fetch approved courses
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*, instructor:profiles!instructor_id(*)")
          .eq("status", "approved")
          .order("total_students", { ascending: false })
          .limit(6);

        if (coursesData) setCourses(coursesData as Course[]);

        // Fetch real instructors
        const { data: instructorsData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "instructor")
          .limit(6);

        if (instructorsData) setInstructors(instructorsData as Profile[]);

        // Fetch platform stats
        const [learnersRes, coursesCountRes, instructorsCountRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "learner"),
          supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "instructor"),
        ]);

        setStats({
          learners: learnersRes.count || 0,
          courses: coursesCountRes.count || 0,
          instructors: instructorsCountRes.count || 0,
        });

        // Fetch a real top review (if any)
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("user_name, comment, rating")
          .gte("rating", 4)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (reviewData) setTopReview(reviewData);
      } catch {
        // Supabase not configured or no data — empty states will show
      }
    }
    loadData();
  }, []);

  const filteredCourses =
    activeTab === "all"
      ? courses
      : courses.filter((c) => c.category === activeTab).slice(0, 3);

  const displayCourses =
    filteredCourses.length > 0 ? filteredCourses : courses.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cat-fintech/5 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Platform for High-Demand Tech Skills
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Learn high-demand tech skills from
            <br />
            people who{" "}
            <span className="gradient-text">actually build it</span>
          </h1>

          <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Stop following generic tutorials. Master real-world tech skills with
            structured roadmaps designed by working engineers — starting with our
            flagship AI and Fintech tracks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button variant="primary" size="lg">
                Start Learning / Browse Courses
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="lg">
                Become an Instructor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Flagship Roadmaps ─── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Flagship Tracks</h2>
              <p className="mt-2 text-text-secondary">
                Our most popular career tracks — with more in-demand tech paths
                coming soon, including software engineering, cloud/DevOps, and
                cybersecurity.
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden sm:flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              All Tracks <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Track */}
            <div className="bg-bg-card border border-border rounded-xl p-8 card-hover group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Zero to AI Engineer</h3>
              <p className="text-text-secondary text-sm mb-6">
                Master LLMs, RAG architectures, and fine-tuning with
                production-grade Python and Rust.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Flagship Path
                </p>
                {[
                  "Phase 1: Deep Learning Fundamentals",
                  "Phase 2: Transformer Architectures",
                  "Phase 3: Building Autonomous Agents",
                  "Phase 4: Scaling AI Systems in Production",
                ].map((phase, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-text-secondary"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent/40" />
                    {phase}
                  </div>
                ))}
              </div>
              <Link
                href="/courses?category=ai"
                className="inline-flex items-center gap-1 mt-6 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                View Full Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Fintech Track */}
            <div className="bg-bg-card border border-border rounded-xl p-8 card-hover group">
              <div className="w-12 h-12 rounded-xl bg-cat-fintech/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-[#0ea5e9]" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Zero to Fintech Analyst
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Build high-frequency trading engines and secure payment protocols
                with Golang and Solidity.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-[#0ea5e9] font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Flagship Path
                </p>
                {[
                  "Phase 1: Financial Market Structures",
                  "Phase 2: High-Performance Computing",
                  "Phase 3: Blockchain & Smart Contracts",
                  "Phase 4: Algorithmic Strategy Development",
                ].map((phase, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-text-secondary"
                  >
                    <div className="w-2 h-2 rounded-full bg-cat-fintech/40" />
                    {phase}
                  </div>
                ))}
              </div>
              <Link
                href="/courses?category=fintech"
                className="inline-flex items-center gap-1 mt-6 text-sm text-[#0ea5e9] hover:text-[#38bdf8] transition-colors"
              >
                View Full Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Instructor Spotlight ─── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          {instructors.length > 0 ? (
            <>
              <p className="text-xs text-text-muted uppercase tracking-[0.2em] mb-10">
                Learn from verified industry practitioners
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {instructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-cat-fintech/20 border-2 border-border flex items-center justify-center text-2xl font-bold text-accent group-hover:border-accent/50 transition-colors overflow-hidden">
                      {instructor.avatar_url ? (
                        <img
                          src={instructor.avatar_url}
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">
                        {instructor.name}
                      </p>
                      {instructor.title && (
                        <p className="text-xs text-text-muted">
                          {instructor.title}
                        </p>
                      )}
                      {instructor.company && (
                        <p className="text-xs text-accent">
                          {instructor.company}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Become One of Our First Instructors
              </h3>
              <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
                Are you a working engineer with production expertise? Share your
                knowledge and help shape the next generation of tech
                professionals.
              </p>
              <Link href="/signup">
                <Button variant="primary" size="md">
                  Apply to Teach <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Courses ─── */}
      <section className="py-20 px-4 sm:px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Courses</h2>
              <p className="mt-2 text-text-secondary">
                Practical, project-based courses for immediate application.
              </p>
            </div>
            {courses.length > 0 && (
              <div className="flex items-center gap-2">
                {[
                  { key: "ai", label: "AI & ML" },
                  { key: "fintech", label: "Fintech" },
                  { key: "other", label: "Other Tech" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? "bg-accent text-white"
                        : "bg-bg-card text-text-secondary hover:text-text-primary border border-border"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {courses.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {displayCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  href="/courses"
                  className="text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  Browse All Courses →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-bg-card border border-border rounded-xl">
              <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No courses published yet
              </h3>
              <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
                Our first courses are being prepared by expert instructors.
                Check back soon or sign up to be notified when they launch.
              </p>
              <Link href="/signup">
                <Button variant="secondary" size="md">
                  Get Notified
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Stats */}
            <div>
              <h2 className="text-3xl font-bold mb-2">
                A growing community of engineers leveling up their careers.
              </h2>
              {(stats.learners > 0 ||
                stats.courses > 0 ||
                stats.instructors > 0) && (
                <div className="flex items-center gap-8 mt-8">
                  {stats.learners > 0 && (
                    <div>
                      <p className="text-3xl font-bold">
                        {stats.learners.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">
                        Learners
                      </p>
                    </div>
                  )}
                  {stats.courses > 0 && (
                    <div>
                      <p className="text-3xl font-bold">{stats.courses}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">
                        Courses
                      </p>
                    </div>
                  )}
                  {stats.instructors > 0 && (
                    <div>
                      <p className="text-3xl font-bold">{stats.instructors}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">
                        Instructors
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Testimonial — only show when a real review exists */}
              {topReview && (
                <div className="mt-10 p-6 bg-bg-card border border-border rounded-xl">
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    &ldquo;{topReview.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                      {topReview.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {topReview.user_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Why Mindbase */}
            <div className="bg-bg-card border border-border rounded-xl p-8">
              <h3 className="text-xl font-bold text-accent mb-6">
                Why Mindbase Academy?
              </h3>
              <div className="space-y-5">
                {[
                  {
                    icon: Code2,
                    title: "Production-Grade Labs",
                    desc: "No hello worlds. Build systems that handle real traffic.",
                  },
                  {
                    icon: Award,
                    title: "Industry Practitioners",
                    desc: "Learn from engineers who build at top tech companies.",
                  },
                  {
                    icon: Users,
                    title: "Structured Roadmaps",
                    desc: "End-to-end career paths from beginner to job-ready.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-sm text-text-muted mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-sm text-accent flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  Ready to level up?
                </p>
                <p className="text-xs text-text-muted mb-4">
                  Start your journey into high-demand tech today.
                </p>
                <Link href="/signup">
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
