"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Check,
  X,
  Eye,
  UserCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

// Sample data
const sampleStats = {
  totalUsers: 15420,
  totalCourses: 186,
  pendingReviews: 8,
  totalRevenue: 12450000,
};

const samplePendingCourses = [
  { id: "p1", title: "Advanced Rust for Blockchain", instructor_name: "Elena Rodriguez", category: "fintech", submitted_at: "2024-11-05", lessons: 42 },
  { id: "p2", title: "GANs for Financial Data Synthesis", instructor_name: "Dr. Sarah Chen", category: "ai", submitted_at: "2024-11-04", lessons: 28 },
  { id: "p3", title: "Real-Time Fraud Detection", instructor_name: "Marcus Thorne", category: "fintech", submitted_at: "2024-11-03", lessons: 36 },
];

const samplePendingInstructors = [
  { id: "u1", name: "Alex Johnson", email: "alex@startup.io", applied_at: "2024-11-06", bio: "10 years in ML engineering at Google Brain" },
  { id: "u2", name: "Priya Sharma", email: "priya@fintech.co", applied_at: "2024-11-05", bio: "Lead quant developer at Jump Trading" },
];

const sampleRecentUsers = [
  { id: "ru1", name: "Jordan Lee", email: "jordan@dev.io", role: "learner", created_at: "2024-11-07" },
  { id: "ru2", name: "Maria Costa", email: "maria@eng.com", role: "instructor", created_at: "2024-11-06" },
  { id: "ru3", name: "Sam Park", email: "sam@tech.io", role: "learner", created_at: "2024-11-06" },
  { id: "ru4", name: "Taylor Wu", email: "taylor@ml.co", role: "pending_instructor", created_at: "2024-11-05" },
];

export default function AdminPanel() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(sampleStats);
  const [pendingCourses, setPendingCourses] = useState(samplePendingCourses);
  const [pendingInstructors, setPendingInstructors] = useState(samplePendingInstructors);
  const [recentUsers, setRecentUsers] = useState(sampleRecentUsers);
  const [activeTab, setActiveTab] = useState<"courses" | "instructors" | "users">("courses");

  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function load() {
      try {
        const supabase = createClient();

        // Platform stats
        const [usersRes, coursesRes, pendingRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        setStats({
          totalUsers: usersRes.count || sampleStats.totalUsers,
          totalCourses: coursesRes.count || sampleStats.totalCourses,
          pendingReviews: pendingRes.count || sampleStats.pendingReviews,
          totalRevenue: sampleStats.totalRevenue,
        });

        // Pending courses
        const { data: pendingCoursesData } = await supabase
          .from("courses")
          .select("*, instructor:profiles!instructor_id(name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (pendingCoursesData && pendingCoursesData.length > 0) {
          setPendingCourses(
            pendingCoursesData.map((c: any) => ({
              id: c.id,
              title: c.title,
              instructor_name: c.instructor?.name || "Unknown",
              category: c.category,
              submitted_at: c.created_at,
              lessons: c.total_lessons || 0,
            }))
          );
        }

        // Pending instructors
        const { data: pendingInstructorsData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "pending_instructor")
          .order("created_at", { ascending: false });

        if (pendingInstructorsData && pendingInstructorsData.length > 0) {
          setPendingInstructors(
            pendingInstructorsData.map((p: any) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              applied_at: p.created_at,
              bio: p.bio || "No bio provided",
            }))
          );
        }

        // Recent users
        const { data: usersData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (usersData && usersData.length > 0) {
          setRecentUsers(
            usersData.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              created_at: u.created_at,
            }))
          );
        }
      } catch { }
    }
    load();
  }, [profile, router]);

  const handleApproveCourse = async (courseId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("courses").update({ status: "approved" }).eq("id", courseId);
      setPendingCourses(pendingCourses.filter((c) => c.id !== courseId));
    } catch { }
  };

  const handleRejectCourse = async (courseId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("courses").update({ status: "rejected" }).eq("id", courseId);
      setPendingCourses(pendingCourses.filter((c) => c.id !== courseId));
    } catch { }
  };

  const handleApproveInstructor = async (userId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("profiles").update({ role: "instructor" }).eq("id", userId);
      setPendingInstructors(pendingInstructors.filter((i) => i.id !== userId));
    } catch { }
  };

  const handleRejectInstructor = async (userId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("profiles").update({ role: "learner" }).eq("id", userId);
      setPendingInstructors(pendingInstructors.filter((i) => i.id !== userId));
    } catch { }
  };

  const roleColors: Record<string, string> = {
    admin: "text-error",
    instructor: "text-accent",
    pending_instructor: "text-warning",
    learner: "text-text-secondary",
  };

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-error" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-text-muted text-sm">Platform management and moderation</p>
            </div>
          </div>
          {pendingCourses.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">
              <AlertTriangle className="w-4 h-4" />
              {pendingCourses.length} courses pending review
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { icon: Users, label: "Total Users", value: stats.totalUsers.toLocaleString(), color: "text-accent" },
            { icon: BookOpen, label: "Published Courses", value: stats.totalCourses.toString(), color: "text-success" },
            { icon: Clock, label: "Pending Reviews", value: stats.pendingReviews.toString(), color: "text-warning" },
            { icon: DollarSign, label: "Platform Revenue", value: `$${(stats.totalRevenue / 100).toLocaleString()}`, color: "text-accent" },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-bg-card border border-border rounded-lg p-1 w-fit">
          {[
            { key: "courses" as const, label: "Pending Courses", count: pendingCourses.length },
            { key: "instructors" as const, label: "Instructor Applications", count: pendingInstructors.length },
            { key: "users" as const, label: "All Users", count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.key
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${activeTab === tab.key ? "bg-white/20" : "bg-warning/20 text-warning"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Courses */}
        {activeTab === "courses" && (
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Courses Awaiting Approval</h3>
              <p className="text-xs text-text-muted mt-1">Review and approve or reject submitted courses.</p>
            </div>
            {pendingCourses.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                <Check className="w-10 h-10 mx-auto mb-3 text-success" />
                <p>No courses pending review. All clear!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-5 hover:bg-bg-hover transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold truncate">{course.title}</h4>
                        <Badge category={course.category}>
                          {course.category.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>By {course.instructor_name}</span>
                        <span>{course.lessons} lessons</span>
                        <span>Submitted {new Date(course.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => { }}>
                        <Eye className="w-4 h-4" /> Preview
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleApproveCourse(course.id)}>
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleRejectCourse(course.id)}>
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructor Applications */}
        {activeTab === "instructors" && (
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Instructor Applications</h3>
              <p className="text-xs text-text-muted mt-1">Review and approve new instructor registrations.</p>
            </div>
            {pendingInstructors.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                <UserCheck className="w-10 h-10 mx-auto mb-3 text-success" />
                <p>No pending applications.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingInstructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between p-5 hover:bg-bg-hover transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{instructor.name}</h4>
                        <p className="text-xs text-text-muted">{instructor.email}</p>
                        <p className="text-xs text-text-secondary mt-1">{instructor.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Button variant="primary" size="sm" onClick={() => handleApproveInstructor(instructor.id)}>
                        <UserCheck className="w-4 h-4" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleRejectInstructor(instructor.id)}>
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users List */}
        {activeTab === "users" && (
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Recent Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-6 py-3">User</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Email</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-text-muted uppercase px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-bg-hover transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${roleColors[u.role] || ""}`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
