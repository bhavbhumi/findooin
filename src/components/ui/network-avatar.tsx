import { cn } from "@/lib/utils";

interface NetworkAvatarProps {
  src?: string | null;
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  roleColor?: string; // HSL CSS variable name like "var(--issuer)"
}

const sizeMap = {
  sm: { box: "h-9 w-9 sm:h-10 sm:w-10", text: "text-xs", radius: "rounded-full", node: "h-1.5 w-1.5", offset: "-1px" },
  md: { box: "h-11 w-11 sm:h-14 sm:w-14", text: "text-xs sm:text-sm", radius: "rounded-full", node: "h-2 w-2", offset: "-1px" },
  lg: { box: "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24", text: "text-lg sm:text-xl md:text-2xl", radius: "rounded-full", node: "h-2 w-2 sm:h-2.5 sm:w-2.5", offset: "0px" },
  xl: { box: "h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32", text: "text-2xl sm:text-3xl md:text-4xl", radius: "rounded-full", node: "h-2.5 w-2.5 sm:h-3 sm:w-3", offset: "0px" },
};

export const NetworkAvatar = ({
  src,
  initials,
  size = "lg",
  className,
  roleColor,
}: NetworkAvatarProps) => {
  const s = sizeMap[size];
  const nodeColor = roleColor || "hsl(var(--primary))";

  return (
    <div className={cn("relative shrink-0", s.box, className)}>
      {/* Main avatar */}
      <div
        className={cn(
          s.box,
          s.radius,
          "overflow-hidden bg-muted flex items-center justify-center font-bold font-heading text-muted-foreground border-[3px] border-card shadow-lg ring-2 ring-border"
        )}
      >
        {src ? (
          <img src={src} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <span className={s.text}>{initials}</span>
        )}
      </div>

      {/* Network node dots at corners */}
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => {
        const posStyles: Record<string, React.CSSProperties> = {
          "top-left": { top: s.offset, left: s.offset },
          "top-right": { top: s.offset, right: s.offset },
          "bottom-left": { bottom: s.offset, left: s.offset },
          "bottom-right": { bottom: s.offset, right: s.offset },
        };
        return (
          <span
            key={pos}
            className={cn(s.node, "absolute rounded-full border-2 border-card")}
            style={{
              ...posStyles[pos],
              backgroundColor: nodeColor,
            }}
          />
        );
      })}
    </div>
  );
};
