import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Fragment } from "react";

const LABEL_MAP: Record<string, string> = {
  feed: "Feed",
  network: "Network",
  jobs: "Jobs",
  events: "Events",
  discover: "Discover",
  showcase: "Showcase",
  profile: "Profile",
  settings: "Settings",
  messages: "Messages",
  notifications: "Notifications",
  vault: "My Vault",
  blog: "Blog",
  admin: "Admin",
  about: "About",
  contact: "Contact",
  legal: "Legal",
  privacy: "Privacy",
  terms: "Terms",
  help: "Help Desk",
  install: "Install",
};

export function AppBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Don't render for root or single-segment routes
  if (segments.length < 1) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/feed">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, i) => {
          const path = "/" + segments.slice(0, i + 1).join("/");
          const label = LABEL_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
          const isLast = i === segments.length - 1;

          return (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
