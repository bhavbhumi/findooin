import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarWithFallbackProps {
  src?: string | null;
  initials: string;
  className?: string;
  textClassName?: string;
  roleColor?: string; // HSL CSS value like "hsl(var(--issuer))"
}

export function AvatarWithFallback({ src, initials, className, textClassName, roleColor }: AvatarWithFallbackProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!src && !imgError;

  const initialsGradient = roleColor
    ? `linear-gradient(135deg, ${roleColor}, hsl(var(--primary)))`
    : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)))";

  return (
    <div
      className={cn("flex items-center justify-center", className, !showImage && "text-white")}
      style={!showImage ? { background: initialsGradient } : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt="avatar"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={cn("font-bold font-heading drop-shadow-sm", textClassName)}>
          {initials}
        </span>
      )}
    </div>
  );
}
