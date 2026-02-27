import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useJobs, useSavedJobs, useMyApplications } from "@/hooks/useJobs";
import { useRole } from "@/contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import {
  BarChart3, Building2, TrendingUp, Briefcase, MapPin,
  IndianRupee, Award, Flame, Bookmark, FileText, ShieldCheck,
  Target, Zap, Globe, Users
} from "lucide-react";
import { CATEGORY_LABELS } from "./JobCard";

interface JobsSidebarProps {
  onCategoryClick?: (category: string) => void;
  onLocationClick?: (location: string) => void;
}

export function JobsSidebar({ onCategoryClick, onLocationClick }: JobsSidebarProps) {
  const { userId } = useRole();
  const { data: jobs } = useJobs();
  const { data: savedJobIds } = useSavedJobs();
  const { data: myApps } = useMyApplications();

  // ─── Market Stats ─────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!jobs?.length) return null;
    const total = jobs.length;
    const remote = jobs.filter((j) => j.is_remote).length;
    const avgSalary = jobs
      .filter((j) => j.salary_min || j.salary_max)
      .reduce((sum, j) => sum + ((j.salary_min || 0) + (j.salary_max || 0)) / 2, 0);
    const salaryCount = jobs.filter((j) => j.salary_min || j.salary_max).length;
    return {
      total,
      remote,
      remotePercent: Math.round((remote / total) * 100),
      avgSalary: salaryCount > 0 ? Math.round(avgSalary / salaryCount) : 0,
      newThisWeek: jobs.filter((j) => {
        const d = new Date(j.created_at);
        return d > new Date(Date.now() - 7 * 86400000);
      }).length,
    };
  }, [jobs]);

  // ─── Category Breakdown ───────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    if (!jobs?.length) return [];
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      counts[j.job_category] = (counts[j.job_category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, count]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        count,
        percent: Math.round((count / jobs.length) * 100),
      }));
  }, [jobs]);

  // ─── Top Hiring Companies ────────────────────────────────────
  const topCompanies = useMemo(() => {
    if (!jobs?.length) return [];
    const counts: Record<string, { count: number; logo: string | null; verified: boolean }> = {};
    jobs.forEach((j) => {
      if (!counts[j.company_name]) {
        counts[j.company_name] = {
          count: 0,
          logo: j.company_logo_url,
          verified: j.poster_profile?.verification_status === "verified",
        };
      }
      counts[j.company_name].count++;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
  }, [jobs]);

  // ─── Skills in Demand ────────────────────────────────────────
  const hotSkills = useMemo(() => {
    if (!jobs?.length) return [];
    const skillMap: Record<string, number> = {};
    jobs.forEach((j) => {
      [...j.skills_required, ...j.certifications_preferred].forEach((s) => {
        if (s) skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });
    return Object.entries(skillMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }, [jobs]);

  // ─── Top Locations ───────────────────────────────────────────
  const topLocations = useMemo(() => {
    if (!jobs?.length) return [];
    const locMap: Record<string, number> = {};
    jobs.forEach((j) => {
      if (j.location) locMap[j.location] = (locMap[j.location] || 0) + 1;
    });
    return Object.entries(locMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([loc, count]) => ({ location: loc, count }));
  }, [jobs]);

  // ─── Salary Insights ────────────────────────────────────────
  const salaryInsights = useMemo(() => {
    if (!jobs?.length) return [];
    const catSalaries: Record<string, { min: number[]; max: number[] }> = {};
    jobs.forEach((j) => {
      if (j.salary_min || j.salary_max) {
        if (!catSalaries[j.job_category]) catSalaries[j.job_category] = { min: [], max: [] };
        if (j.salary_min) catSalaries[j.job_category].min.push(j.salary_min);
        if (j.salary_max) catSalaries[j.job_category].max.push(j.salary_max);
      }
    });
    const fmt = (n: number) => {
      if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return n.toString();
    };
    return Object.entries(catSalaries)
      .slice(0, 4)
      .map(([cat, data]) => {
        const avgMin = data.min.length > 0 ? data.min.reduce((a, b) => a + b, 0) / data.min.length : 0;
        const avgMax = data.max.length > 0 ? data.max.reduce((a, b) => a + b, 0) / data.max.length : 0;
        return {
          category: CATEGORY_LABELS[cat] || cat,
          range: `₹${fmt(avgMin)} – ₹${fmt(avgMax)}`,
        };
      });
  }, [jobs]);

  // ─── My Activity Summary (quick glance) ──────────────────────
  const activitySummary = useMemo(() => {
    return {
      applied: myApps?.length || 0,
      saved: savedJobIds?.length || 0,
      interviewing: myApps?.filter((a) => a.status === "interviewing").length || 0,
      offers: myApps?.filter((a) => a.status === "offered" || a.status === "hired").length || 0,
    };
  }, [myApps, savedJobIds]);

  const fmtSalary = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  return (
    <div className="space-y-4">
      {/* Market Pulse */}
      {stats && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Job Market Pulse
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatBox icon={<Briefcase className="h-3.5 w-3.5" />} label="Active Jobs" value={stats.total} />
            <StatBox icon={<Zap className="h-3.5 w-3.5" />} label="New This Week" value={stats.newThisWeek} highlight />
            <StatBox icon={<Globe className="h-3.5 w-3.5" />} label="Remote" value={`${stats.remotePercent}%`} />
            <StatBox
              icon={<IndianRupee className="h-3.5 w-3.5" />}
              label="Avg Salary"
              value={stats.avgSalary > 0 ? fmtSalary(stats.avgSalary) : "—"}
            />
          </div>
        </div>
      )}

      {/* My Activity */}
      {userId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            My Activity
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatBox icon={<FileText className="h-3.5 w-3.5" />} label="Applied" value={activitySummary.applied} />
            <StatBox icon={<Bookmark className="h-3.5 w-3.5" />} label="Saved" value={activitySummary.saved} />
            <StatBox icon={<Users className="h-3.5 w-3.5" />} label="Interviewing" value={activitySummary.interviewing} highlight={activitySummary.interviewing > 0} />
            <StatBox icon={<Award className="h-3.5 w-3.5" />} label="Offers" value={activitySummary.offers} highlight={activitySummary.offers > 0} />
          </div>
        </div>
      )}

      {/* Hot Categories */}
      {categoryBreakdown.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Hot Categories
          </h3>
          <div className="space-y-2">
            {categoryBreakdown.map((cat) => (
              <button
                key={cat.category}
                onClick={() => onCategoryClick?.(cat.category)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-card-foreground group-hover:text-primary transition-colors truncate">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{cat.count} jobs</span>
                </div>
                <Progress value={cat.percent} className="h-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Hiring Companies */}
      {topCompanies.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Top Hiring
          </h3>
          <div className="space-y-2.5">
            {topCompanies.map((co) => (
              <div key={co.name} className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  {co.logo ? (
                    <img src={co.logo} alt={co.name} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate flex items-center gap-1">
                    {co.name}
                    {co.verified && <ShieldCheck className="h-3 w-3 text-primary shrink-0" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {co.count} open {co.count === 1 ? "role" : "roles"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills in Demand */}
      {hotSkills.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Skills in Demand
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {hotSkills.map((s) => (
              <Badge
                key={s.skill}
                variant="outline"
                className="text-[10px] gap-1 cursor-default hover:bg-primary/5 transition-colors"
              >
                {s.skill}
                <span className="text-muted-foreground/60">{s.count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Top Locations */}
      {topLocations.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Top Locations
          </h3>
          <div className="space-y-1.5">
            {topLocations.map((loc) => (
              <button
                key={loc.location}
                onClick={() => onLocationClick?.(loc.location)}
                className="w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors text-card-foreground"
              >
                <span className="truncate">{loc.location}</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0 ml-2">
                  {loc.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Salary Insights */}
      {salaryInsights.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            Salary Insights
          </h3>
          <div className="space-y-2">
            {salaryInsights.map((si) => (
              <div key={si.category} className="flex items-center justify-between">
                <span className="text-xs text-card-foreground truncate">{si.category}</span>
                <span className="text-[10px] font-medium text-muted-foreground shrink-0 ml-2">{si.range}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-card-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
