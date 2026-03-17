import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, Sparkles, LucideIcon } from "lucide-react";
import { PageHero } from "@/components/PageHero";

interface ComparisonFeature {
  icon: LucideIcon;
  feature: string;
  findoo: string;
  competitor: string;
  findooHas: boolean;
  competitorHas: boolean;
}

interface ComparisonStat {
  label: string;
  value: string;
  description: string;
}

export interface ComparisonData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  competitor: string;
  competitorExamples: string;
  stats: ComparisonStat[];
  features: ComparisonFeature[];
  verdict: { title: string; description: string };
  cta: { title: string; subtitle: string };
}

export function ComparisonPage({ data }: { data: ComparisonData }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <PageHero
        breadcrumb="Compare"
        title={data.heroTitle}
        subtitle={data.heroSubtitle}
        variant="hexagons"
      />

      {/* Description */}
      <section className="container py-10">
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center leading-relaxed">
          {data.heroDescription}
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Compared with: <span className="font-medium text-foreground">{data.competitorExamples}</span>
        </p>
      </section>

      {/* Stats */}
      <section className="container pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.stats.map((stat, i) => (
            <Card key={i} className="text-center border-primary/10">
              <CardContent className="pt-6 pb-4">
                <p className="text-2xl md:text-3xl font-bold font-heading text-primary">{stat.value}</p>
                <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container pb-12">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-8">
          Feature-by-Feature Comparison
        </h2>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 text-sm font-semibold text-foreground w-[35%]">Feature</th>
                <th className="text-left p-4 text-sm font-semibold text-primary w-[32.5%]">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> FindOO
                  </span>
                </th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[32.5%]">
                  {data.competitor}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((f, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <f.icon className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">{f.feature}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      {f.findooHas ? (
                        <Check className="h-4 w-4 text-chart-2 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm text-muted-foreground">{f.findoo}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      {f.competitorHas ? (
                        <Check className="h-4 w-4 text-chart-2 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm text-muted-foreground">{f.competitor}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {data.features.map((f, i) => (
            <Card key={i} className="border-primary/10">
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <f.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{f.feature}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
                    {f.findooHas ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-primary text-xs mb-0.5">FindOO</p>
                      <p className="text-muted-foreground">{f.findoo}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                    {f.competitorHas ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-muted-foreground text-xs mb-0.5">{data.competitor}</p>
                      <p className="text-muted-foreground">{f.competitor}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Verdict */}
      <section className="container pb-12">
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="py-8 px-6 md:px-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-4">
              {data.verdict.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {data.verdict.description}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            {data.cta.title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {data.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild>
              <Link to="/auth?mode=signup">
                Join FindOO — It's Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/explore">Explore the Platform</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
