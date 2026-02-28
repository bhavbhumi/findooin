import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarWithFallbackProps {
  src?: string | null;
  initials: string;
  className?: string;
  textClassName?: string;
}

export function AvatarWithFallback({ src, initials, className, textClassName }: AvatarWithFallbackProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!src && !imgError;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {showImage ? (
        <img
          src={src}
          alt="avatar"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={cn("font-bold font-heading text-muted-foreground", textClassName)}>
          {initials}
        </span>
      )}
    </div>
  );
}
