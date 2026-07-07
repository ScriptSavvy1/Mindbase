import Link from "next/link";
import Image from "next/image";
import { Clock, BarChart3, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  ai: "AI & ML",
  fintech: "Fintech",
  other: "Other Tech",
};

export function CourseCard({ course, className = "" }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className={`group block bg-bg-card border border-border rounded-xl overflow-hidden card-hover ${className}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-bg-elevated">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-card">
            <span className="text-3xl font-bold text-text-muted opacity-30">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge category={course.category}>
            {categoryLabels[course.category] || course.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent overflow-hidden">
            {course.instructor?.avatar_url ? (
              <Image
                src={course.instructor.avatar_url}
                alt={course.instructor.name}
                width={24}
                height={24}
                className="object-cover"
              />
            ) : (
              course.instructor?.name?.charAt(0) || "?"
            )}
          </div>
          <span className="text-sm text-text-secondary truncate">
            {course.instructor?.name || "Instructor"}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {course.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
          <StarRating
            rating={course.average_rating}
            count={course.total_reviews}
            size="sm"
          />
          {course.total_duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.total_duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {course.skill_level}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-accent">
              {course.price === 0
                ? "Free"
                : `$${(course.price / 100).toFixed(0)}`}
            </span>
            {course.original_price && course.original_price > course.price && (
              <span className="text-sm text-text-muted line-through">
                ${(course.original_price / 100).toFixed(0)}
              </span>
            )}
          </div>
          <span className="text-sm text-text-secondary group-hover:text-accent transition-colors flex items-center gap-1">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
