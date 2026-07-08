"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Download,
  Sparkles,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types";

export default function InstructorDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    activeCourses: 0,
    totalCourses: 0,
    avgRating: 0,
  });
  const [courses, setCourses] = useState<(Course & { revenue?: number })[]>([]);

  useEffect(() => {
    if (!user) return;
    if (profile && profile.role !== "instructor" && profile.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("courses")
          .select("*")
          .eq("instructor_id", user!.id)
          .order("updated_at", { ascending: false });

        if (data) {
          setCourses(data as any);

          const approved = data.filter((c: any) => c.status === "approved");
          const totalStudents = approved.reduce((s: number, c: any) => s + (c.total_students || 0), 0);
          const totalRevenue = approved.reduce((s: number, c: any) => s + (c.total_students || 0) * (c.price || 0), 0);
          const ratings = approved.filter((c: any) => c.average_rating > 0).map((c: any) => Number(c.average_rating));
          const avgR = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

          setStats({
            totalRevenue,
            totalStudents,
            activeCourses: approved.length,
            totalCourses: data.length,
            avgRating: Number(avgR.toFixed(2)),
          });
        }
      } catch {}
    }
    load();
  }, [user, profile, router]);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const supabase = createClient();
      await supabase.from("courses").delete().eq("id", courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch {}
  };

  const statusMap: Record<string, string> = {
    approved: "Published",
    draft: "Draft",
    pending: "Review",
    rejected: "Rejected",
  };

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border min-h-[calc(100vh-4rem)] p-4 gap-1">
          {[
            { icon: BookOpen, label: "Dashboard", href: "/instructor", active: true },
            { icon: FileText, label: "My Courses", href: "/instructor" },
            { icon: Plus, label: "Create Course", href: "/instructor/courses/new" },
            { icon: DollarSign, label: "Earnings", href: "/instructor" },
            { icon: TrendingUp, label: "Analytics", href: "/instructor" },
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
              <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
              <p className="text-text-secondary text-sm mt-1">
                Welcome back, {profile?.name || "Instructor"}. Here&apos;s what&apos;s happening with your courses today.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Link href="/instructor/courses/new">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            {[
              {
                icon: DollarSign,
                label: "Total Revenue",
                value: `$${(stats.totalRevenue / 100).toLocaleString()}`,
                trend: "+12.5%",
                trendUp: true,
              },
              {
                icon: Users,
                label: "Total Enrollments",
                value: stats.totalStudents.toLocaleString(),
                trend: "+8.2%",
                trendUp: true,
              },
              {
                icon: BookOpen,
                label: "Active Courses",
                value: stats.activeCourses.toString(),
                trend: "0%",
                trendUp: false,
              },
              {
                icon: Star,
                label: "Avg. Student Rating",
                value: stats.avgRating.toFixed(2),
                trend: "+0.2",
                trendUp: true,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      stat.trendUp ? "text-success" : "text-text-muted"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions + Latest Reviews */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Earnings Chart placeholder */}
            <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold">Earnings Over Time</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Visualizing revenue and student growth
                  </p>
                </div>
                <div className="flex gap-1">
                  {["1W", "1M", "1Y"].map((period) => (
                    <button
                      key={period}
                      className="px-3 py-1 text-xs rounded bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              {/* Simple CSS chart */}
              <div className="h-48 flex items-end gap-1">
                {[40, 55, 65, 50, 75, 85, 70, 90, 80, 95, 88, 100].map(
                  (h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-accent/60 to-accent transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-text-muted px-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "", "", "", "", ""].map(
                  (d, i) => (
                    <span key={i}>{d}</span>
                  )
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-accent flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4" /> Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: Plus, label: "New Module" },
                    { icon: Pencil, label: "Update Curriculum" },
                    { icon: MessageSquare, label: "Message Students" },
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-4">Latest Reviews</h3>
                <div className="space-y-3">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="p-3 bg-bg-elevated rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-[10px] text-text-muted ml-1">
                          2h ago
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        &ldquo;This advanced LLM course was exactly what I
                        needed. The hands-on...&rdquo;
                      </p>
                      <p className="text-[10px] text-accent mt-1 uppercase">
                        LLM Mastery Course
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Published Courses</h3>
              <p className="text-sm text-text-muted mt-1">
                Manage your existing curriculum and track performance per
                course.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                      Course Name
                    </th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Enrollments
                    </th>
                    <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Rating
                    </th>
                    <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Revenue
                    </th>
                    <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-bg-hover transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">{course.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Last edited{" "}
                            {new Date(course.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="status" category={course.status}>
                          {statusMap[course.status] || course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        {course.total_students.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        {course.average_rating > 0 ? (
                          <span className="flex items-center justify-end gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {Number(course.average_rating).toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-text-muted">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        $
                        {(
                          ((course as any).revenue || course.total_students * course.price) /
                          100
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/instructor/courses/${course.id}/edit`}>
                            <button className="p-2 hover:bg-bg-elevated rounded transition-colors cursor-pointer">
                              <Pencil className="w-4 h-4 text-text-muted hover:text-accent" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 hover:bg-error/10 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-error" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-text-muted">
                Showing {courses.length} of {courses.length} courses
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                  Previous
                </button>
                <button className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
