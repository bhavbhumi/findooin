/**
 * AdminComingSoon — Placeholder for future admin sections.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

interface AdminComingSoonProps {
  title: string;
  description: string;
  features?: string[];
}

export function AdminComingSoon({ title, description, features }: AdminComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Construction className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading">{title}</h2>
            <Badge variant="secondary" className="text-[10px] mt-1">Coming Soon</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {features && features.length > 0 && (
            <div className="text-left space-y-1.5 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Planned features:</p>
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  {f}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
