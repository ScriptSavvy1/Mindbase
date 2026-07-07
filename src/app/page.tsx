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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import type { Course, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

// ─── Sample data for static rendering (replaced by Supabase when DB is seeded) ───

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Building Production RAG Systems with Vector Databases",
    description: "",
    category: "ai",
    skill_level: "intermediate",
    price: 14900,
    original_price: null,
    instructor_id: "1",
    status: "approved",
    thumbnail_url: null,
    total_duration: "24h",
    total_lessons: 128,
    total_students: 2400,
    average_rating: 4.9,
    total_reviews: 312,
    learning_outcomes: [],
    language: "English",
    created_at: "",
    updated_at: "",
    instructor: {
      id: "1",
      name: "Dr. Sarah Chen",
      email: "",
      role: "instructor",
      avatar_url: null,
      bio: null,
      title: "Principal ML Researcher",
      company: "OpenAI",
      created_at: "",
    },
  },
  {
    id: "2",
    title: "High-Frequency Trading in Go: Low Latency Mastery",
    description: "",
    category: "fintech",
    skill_level: "advanced",
    price: 19900,
    original_price: null,
    instructor_id: "2",
    status: "approved",
    thumbnail_url: null,
    total_duration: "18h",
    total_lessons: 96,
    total_students: 1500,
    average_rating: 4.8,
    total_reviews: 198,
    learning_outcomes: [],
    language: "English",
    created_at: "",
    updated_at: "",
    instructor: {
      id: "2",
      name: "Marcus Thorne",
      email: "",
      role: "instructor",
      avatar_url: null,
      bio: null,
      title: "Core Systems Engineer",
      company: "Stripe",
      created_at: "",
    },
  },
  {
    id: "3",
    title: "Advanced Smart Contract Auditing & Security",
    description: "",
    category: "fintech",
    skill_level: "advanced",
    price: 24900,
    original_price: null,
    instructor_id: "3",
    status: "approved",
    thumbnail_url: null,
    total_duration: "15h",
    total_lessons: 84,
    total_students: 850,
    average_rating: 5.0,
    total_reviews: 142,
    learning_outcomes: [],
    language: "English",
    created_at: "",
    updated_at: "",
    instructor: {
      id: "3",
      name: "Elena Rodriguez",
      email: "",
      role: "instructor",
      avatar_url: null,
      bio: null,
      title: "Blockchain Architect",
      company: "Ethereum Foundation",
      created_at: "",
    },
  },
];

const sampleInstructors = [
  { name: "Dr. Sarah Chen", title: "Principal ML Researcher", company: "OpenAI" },
  { name: "Marcus Thorne", title: "Core Systems Engineer", company: "Stripe" },
  { name: "Elena Rodriguez", title: "Blockchain Architect", company: "Ethereum Foundation" },
  { name: "David Park", title: "Quantitative Analyst", company: "Goldman Sachs" },
  { name: "Jason Wu", title: "DevOps Lead", company: "Netflix" },
];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [activeTab, setActiveTab] = useState("ai");

  useEffect(() => {
    async function loadCourses() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("courses")
          .select("*, instructor:profiles!instructor_id(*)")
          .eq("status", "approved")
          .order("total_students", { ascending: false })
          .limit(6);

        if (data && data.length > 0) {
          setCourses(data as Course[]);
        }
      } catch {
        // Use sample data if Supabase isn't configured
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = activeTab === "all"
    ? courses
    : courses.filter((c) => c.category === activeTab).slice(0, 3);

  const displayCourses = filteredCourses.length > 0 ? filteredCourses : courses.slice(0, 3);

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
            Platform for Industrial-Grade Engineering
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Learn AI and Fintech from
            <br />
            people who{" "}
            <span className="gradient-text">actually build it</span>
          </h1>

          <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Stop following generic tutorials. Master high-performance systems
            with structured roadmaps designed by engineers from OpenAI, Stripe,
            and Goldman Sachs.
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
              <h2 className="text-3xl font-bold">Flagship Roadmaps</h2>
              <p className="mt-2 text-text-secondary">
                Our most popular career tracks. End-to-end paths designed to take
                you from a curious developer to a specialized engineer.
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden sm:flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              All Roadmaps <ChevronRight className="w-4 h-4" />
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
          <p className="text-xs text-text-muted uppercase tracking-[0.2em] mb-10">
            Instructors from the world&apos;s leading tech institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {sampleInstructors.map((instructor, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-cat-fintech/20 border-2 border-border flex items-center justify-center text-2xl font-bold text-accent group-hover:border-accent/50 transition-colors">
                  {instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{instructor.name}</p>
                  <p className="text-xs text-text-muted">{instructor.title}</p>
                  <p className="text-xs text-accent">{instructor.company}</p>
                </div>
              </div>
            ))}
          </div>
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
            <div className="flex items-center gap-2">
              {[
                { key: "ai", label: "AI & ML" },
                { key: "fintech", label: "Fintech" },
                { key: "other", label: "Systems Engineering" },
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
          </div>

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
              Browse All 150+ Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Stats */}
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Trusted by engineers at top tech companies worldwide.
              </h2>
              <div className="flex items-center gap-8 mt-8">
                {[
                  { value: "15k+", label: "Learners" },
                  { value: "4.9/5", label: "Avg. Rating" },
                  { value: "180+", label: "Countries" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-10 p-6 bg-bg-card border border-border rounded-xl">
                <p className="text-sm text-text-secondary italic leading-relaxed">
                  &ldquo;Mindbase is the first platform that didn&apos;t treat me
                  like a beginner. The &apos;HFT in Go&apos; course literally
                  helped me land my senior role at a top prop firm.&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                    AS
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Alex Sorenson</p>
                    <p className="text-xs text-text-muted">
                      Senior Software Engineer
                    </p>
                  </div>
                </div>
              </div>
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
                    desc: "No hello worlds. Build systems that handle traffic.",
                  },
                  {
                    icon: Award,
                    title: "Industry Accredited",
                    desc: "Certificates recognized by top fintech and AI firms.",
                  },
                  {
                    icon: Users,
                    title: "Peer-to-Peer Review",
                    desc: "Get your code reviewed by verified industry experts.",
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
                  Join 500+ engineers starting roadmaps today.
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
