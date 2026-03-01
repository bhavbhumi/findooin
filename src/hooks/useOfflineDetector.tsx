import { useEffect } from "react";
import { toast } from "sonner";
import { WifiOff, Wifi } from "lucide-react";

export function useOfflineDetector() {
  useEffect(() => {
    let wasOffline = !navigator.onLine;

    const handleOffline = () => {
      wasOffline = true;
      toast.error("You're offline", {
        description: "Some features may be unavailable until you reconnect.",
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
        id: "offline-toast",
      });
    };

    const handleOnline = () => {
      if (wasOffline) {
        wasOffline = false;
        toast.dismiss("offline-toast");
        toast.success("Back online", {
          description: "Your connection has been restored.",
          icon: <Wifi className="h-4 w-4" />,
          duration: 3000,
          id: "online-toast",
        });
      }
    };

    if (!navigator.onLine) handleOffline();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
