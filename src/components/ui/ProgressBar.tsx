interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  size = "md",
  showLabel = true,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-secondary">Progress</span>
          <span className="text-xs font-medium text-text-primary">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div
        className={`w-full ${heights[size]} bg-bg-elevated rounded-full overflow-hidden`}
      >
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${clamped}%`,
            background:
              clamped === 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #6c5ce7, #a78bfa)",
          }}
        />
      </div>
    </div>
  );
}
