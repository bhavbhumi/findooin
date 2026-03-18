import { useLocation, Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import findooLogo from "@/assets/findoo-logo-icon.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Ambient decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-[hsl(43,76%,53%)]/[0.05] blur-3xl" />
        {/* Rotating diamond */}
        <motion.div
          className="absolute top-20 right-20 h-6 w-6 border border-primary/20 rotate-45"
          animate={{ rotate: [45, 405] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        {/* Concentric rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[200, 300, 400].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-primary/[0.04]"
              style={{
                width: size,
                height: size,
                top: `calc(50% - ${size / 2}px)`,
                left: `calc(50% - ${size / 2}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* Logo */}
        <motion.img
          src={findooLogo}
          alt="FindOO"
          className="mx-auto h-12 w-12 mb-6 opacity-60"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />

        {/* Large 404 */}
        <motion.h1
          className="text-8xl sm:text-9xl font-heading font-bold bg-gradient-to-br from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent mb-4 leading-none"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          404
        </motion.h1>

        <h2 className="text-xl sm:text-2xl font-heading font-semibold text-foreground mb-2">
          Page not found
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          The page <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{location.pathname}</code> doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-1.5" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Go Back
          </Button>
          <Button variant="outline" asChild>
            <Link to="/discover">
              <Compass className="h-4 w-4 mr-1.5" />
              Explore
            </Link>
          </Button>
        </div>

        {/* Search hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Try pressing <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">⌘K</kbd> to search</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
