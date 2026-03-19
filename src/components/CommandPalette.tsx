/**
 * CommandPalette — ⌘K / Ctrl+K global spotlight search.
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, User, Users, Briefcase, Calendar, MessageSquare, Bell,
  Settings, Search, BarChart3, FolderOpen, Compass, Shield,
  FileText, Globe,
} from "lucide-react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const NAVIGATION_ITEMS = [
  { label: "Feed", icon: MessageSquare, path: "/feed", group: "Navigate" },
  { label: "Profile", icon: User, path: "/profile", group: "Navigate" },
  { label: "Network", icon: Users, path: "/network", group: "Navigate" },
  { label: "Jobs", icon: Briefcase, path: "/jobs", group: "Navigate" },
  { label: "Events", icon: Calendar, path: "/events", group: "Navigate" },
  { label: "Showcase", icon: Globe, path: "/showcase", group: "Navigate" },
  { label: "Messages", icon: MessageSquare, path: "/messages", group: "Navigate" },
  { label: "Notifications", icon: Bell, path: "/notifications", group: "Navigate" },
  { label: "Discover", icon: Compass, path: "/discover", group: "Navigate" },
  { label: "Vault", icon: FolderOpen, path: "/vault", group: "Navigate" },
  { label: "Analytics", icon: BarChart3, path: "/analytics", group: "Navigate" },
  { label: "Settings", icon: Settings, path: "/settings", group: "Navigate" },
  { label: "Admin Panel", icon: Shield, path: "/admin", group: "Navigate" },
];

const QUICK_ACTIONS = [
  { label: "Create a Post", icon: FileText, path: "/feed", group: "Actions" },
  { label: "Post a Job", icon: Briefcase, path: "/jobs", group: "Actions" },
  { label: "Create an Event", icon: Calendar, path: "/events", group: "Actions" },
  { label: "Search People", icon: Search, path: "/discover", group: "Actions" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isEnabled, isFetched } = useFeatureFlags();

  // Map paths to their feature flag keys
  const FLAG_MAP: Record<string, string> = {
    "/jobs": "jobs_board",
    "/events": "events_module",
    "/showcase": "directory_listings",
    "/messages": "messaging",
    "/vault": "vault_storage",
  };

  const isPathEnabled = (path: string) => {
    const flagKey = FLAG_MAP[path];
    if (!flagKey) return true; // no flag = always visible
    return !isFetched || isEnabled(flagKey);
  };

  const navigationItems = NAVIGATION_ITEMS.filter((item) => isPathEnabled(item.path));
  const quickActions = QUICK_ACTIONS.filter((item) => isPathEnabled(item.path));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, people..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => handleSelect(item.path)}
              className="gap-2 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => handleSelect(item.path)}
              className="gap-2 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
