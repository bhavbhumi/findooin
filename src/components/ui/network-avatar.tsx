import { cn } from "@/lib/utils";

interface NetworkAvatarProps {
  src?: string | null;
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  roleColor?: string; // HSL CSS variable name like "var(--issuer)"
}

const sizeMap = {
  sm: { box: "h-10 w-10", text: "text-xs", radius: "rounded-[22%]", node: "h-1.5 w-1.5", offset: "-2px" },
  md: { box: "h-14 w-14", text: "text-sm", radius: "rounded-[22%]", node: "h-2 w-2", offset: "-3px" },
  lg: { box: "h-24 w-24", text: "text-2xl", radius: "rounded-[22%]", node: "h-2.5 w-2.5", offset: "-4px" },
  xl: { box: "h-28 w-28 sm:h-32 sm:w-32", text: "text-3xl sm:text-4xl", radius: "rounded-[22%]", node: "h-3 w-3", offset: "-5px" },
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
