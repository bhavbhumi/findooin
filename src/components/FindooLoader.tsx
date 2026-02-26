import { motion } from "framer-motion";
import findooLogo from "@/assets/findoo-logo-icon.png";

interface FindooLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function FindooLoader({ text, size = "md" }: FindooLoaderProps) {
  const sizeMap = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-14 w-14" };
  const textSize = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.img
        src={findooLogo}
        alt="Loading"
        className={sizeMap[size]}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {text && (
        <motion.p
          className={`${textSize[size]} text-muted-foreground font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
