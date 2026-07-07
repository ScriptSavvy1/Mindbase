import { StarRating } from "@/components/ui/StarRating";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <StarRating rating={review.rating} size="sm" showValue={false} />
      <p className="text-xs text-text-muted mt-2">
        {timeAgo(review.created_at)}
      </p>
      {review.comment && (
        <p className="text-sm text-text-secondary mt-3 leading-relaxed italic">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
          {review.user_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="text-sm font-medium">{review.user_name}</p>
        </div>
      </div>
    </div>
  );
}
