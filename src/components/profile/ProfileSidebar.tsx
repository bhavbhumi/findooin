import {
  Award, Hash, GraduationCap, Globe, ExternalLink,
  Link2, MapPin, Briefcase, TrendingUp,
} from "lucide-react";
...
  const hasSpecializations = profile.specializations && profile.specializations.length > 0;
  const hasSocialLinks = profile.social_links && Object.keys(profile.social_links).length > 0;
...
      {(hasSpecializations || hasCertifications) && (
...
          </div>
        </div>
      )}

      {/* Social Links */}
      {hasSocialLinks && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Links</h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(profile.social_links!).map(([platform, url]) => (
              <a
                key={platform}
                href={String(url).startsWith("http") ? String(url) : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className="text-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors disabled:cursor-default"
  >
    <p className="text-lg font-bold text-card-foreground leading-none">{value}</p>
    <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
  </button>
);
