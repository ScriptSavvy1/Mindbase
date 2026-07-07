import type { CourseCategory } from "@/types";

interface BadgeProps {
  variant?: "category" | "status" | "level";
  category?: CourseCategory | string;
  children: React.ReactNode;
  className?: string;
}

const categoryColors: Record<string, string> = {
  ai: "bg-cat-ai/15 text-[#a78bfa] border-cat-ai/30",
  fintech: "bg-cat-fintech/15 text-[#38bdf8] border-cat-fintech/30",
  other: "bg-cat-other/15 text-[#34d399] border-cat-other/30",
  devops: "bg-cat-devops/15 text-[#fbbf24] border-cat-devops/30",
  trading: "bg-cat-trading/15 text-[#f472b6] border-cat-trading/30",
  "ai & ml": "bg-cat-ai/15 text-[#a78bfa] border-cat-ai/30",
  roadmap: "bg-accent/15 text-text-accent border-accent/30",
};

const statusColors: Record<string, string> = {
  published: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  draft: "bg-bg-elevated text-text-muted border-border",
  pending: "bg-warning/15 text-warning border-warning/30",
  review: "bg-warning/15 text-warning border-warning/30",
  rejected: "bg-error/15 text-error border-error/30",
};

const levelColors: Record<string, string> = {
  beginner: "bg-success/15 text-success border-success/30",
  intermediate: "bg-cat-fintech/15 text-[#38bdf8] border-cat-fintech/30",
  advanced: "bg-cat-ai/15 text-[#a78bfa] border-cat-ai/30",
};

export function Badge({
  variant = "category",
  category,
  children,
  className = "",
}: BadgeProps) {
  const key = (category || String(children)).toLowerCase();

  let colorClass = "bg-bg-elevated text-text-secondary border-border";

  if (variant === "category" && categoryColors[key]) {
    colorClass = categoryColors[key];
  } else if (variant === "status" && statusColors[key]) {
    colorClass = statusColors[key];
  } else if (variant === "level" && levelColors[key]) {
    colorClass = levelColors[key];
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
