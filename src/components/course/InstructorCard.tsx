import { Star, Users, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types";

interface InstructorCardProps {
  instructor: Profile;
  stats?: {
    rating?: number;
    totalReviews?: number;
    totalStudents?: number;
    totalCourses?: number;
  };
}

export function InstructorCard({ instructor, stats }: InstructorCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Your Instructor</h2>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-cat-fintech/20 border-2 border-border flex items-center justify-center text-2xl font-bold text-accent flex-shrink-0">
          {instructor.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "?"}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold">{instructor.name}</h3>
          {(instructor.title || instructor.company) && (
            <p className="text-sm text-accent">
              {instructor.title}
              {instructor.company && ` @ ${instructor.company}`}
            </p>
          )}
          {instructor.bio && (
            <p className="text-sm text-text-secondary mt-3 leading-relaxed">
              {instructor.bio}
            </p>
          )}

          {/* Stats */}
          {stats && (
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {stats.rating !== undefined && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {stats.rating} Instructor Rating
                </span>
              )}
              {stats.totalReviews !== undefined && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {stats.totalReviews.toLocaleString()} Reviews
                </span>
              )}
              {stats.totalStudents !== undefined && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Users className="w-3.5 h-3.5" />
                  {stats.totalStudents.toLocaleString()} Students
                </span>
              )}
              {stats.totalCourses !== undefined && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <BookOpen className="w-3.5 h-3.5" />
                  {stats.totalCourses} Courses
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm">
              Follow
            </Button>
            <Button variant="secondary" size="sm">
              <MessageSquare className="w-4 h-4" />
              Message Instructor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
