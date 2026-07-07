import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "sm",
  showValue = true,
  count,
  className = "",
}: StarRatingProps) {
  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star
          key={i}
          className={`${sizes[size]} fill-yellow-400 text-yellow-400`}
        />
      );
    } else if (i - 0.5 <= rating) {
      stars.push(
        <StarHalf
          key={i}
          className={`${sizes[size]} fill-yellow-400 text-yellow-400`}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={`${sizes[size]} text-text-muted`}
        />
      );
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showValue && (
        <span className={`${textSizes[size]} font-medium text-yellow-400`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={`${textSizes[size]} text-text-muted`}>
          ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}
