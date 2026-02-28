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

const NAVIGATION_ITEMS = [
  { label: "Feed", icon: MessageSquare, path: "/feed", group: "Navigate" },
  { label: "Profile", icon: User, path: "/profile", group: "Navigate" },
  { label: "Network", icon: Users, path: "/network", group: "Navigate" },
  { label: "Jobs", icon: Briefcase, path: "/jobs", group: "Navigate" },
  { label: "Events", icon: Calendar, path: "/events", group: "Navigate" },
  { label: "Directory", icon: Globe, path: "/directory", group: "Navigate" },
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
          {QUICK_ACTIONS.map((item) => (
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
          {NAVIGATION_ITEMS.map((item) => (
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
