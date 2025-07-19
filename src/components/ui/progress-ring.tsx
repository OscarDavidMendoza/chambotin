import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing = ({ progress, size = "md", className, children }: ProgressRingProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  const strokeWidths = {
    sm: 3,
    md: 4,
    lg: 6
  };

  const radius = size === "sm" ? 28 : size === "md" ? 44 : 60;
  const strokeWidth = strokeWidths[size];
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="hsl(var(--border))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#progressGradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--success))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-sm font-bold text-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};