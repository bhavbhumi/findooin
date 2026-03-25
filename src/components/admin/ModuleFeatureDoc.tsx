/**
 * ModuleFeatureDoc — Reusable accordion-based module specification renderer.
 * Displays: Problem, Solution, Use Cases, Current Scope, Future Scope, Monetisation.
 */
import moduleSpecs, { type ModuleSpec } from "@/data/module-specs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Target, Lightbulb, Users, Telescope, Rocket, Coins,
  Download, Printer,
} from "lucide-react";

interface ModuleFeatureDocProps {
  moduleKey: string;
}

const sections = [
  { key: "problem", label: "Problem Statement", icon: Target, color: "text-destructive" },
  { key: "solution", label: "Solution", icon: Lightbulb, color: "text-primary" },
  { key: "useCases", label: "Use Cases", icon: Users, color: "text-accent-foreground" },
  { key: "currentScope", label: "Current Scope", icon: Telescope, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "futureScope", label: "Future Scope & Scale", icon: Rocket, color: "text-blue-600 dark:text-blue-400" },
  { key: "monetisation", label: "Possible Monetisation", icon: Coins, color: "text-amber-600 dark:text-amber-400" },
] as const;

export function ModuleFeatureDoc({ moduleKey }: ModuleFeatureDocProps) {
  const spec = moduleSpecs[moduleKey];

  if (!spec) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Module specification not yet documented for <strong>{moduleKey}</strong>.
        </CardContent>
      </Card>
    );
  }

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const md = generateMarkdown(spec);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.title.replace(/\s+/g, "-")}-Spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold font-heading">{spec.title} — Module Spec</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Living product document • Last synced with codebase
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export .md
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {/* Accordion Sections */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Accordion type="multiple" defaultValue={["problem", "solution", "currentScope"]} className="space-y-2">
            {sections.map(({ key, label, icon: Icon, color }) => {
              const content = spec[key as keyof ModuleSpec];
              return (
                <AccordionItem key={key} value={key} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="font-semibold text-sm">{label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {typeof content === "string" ? (
                      <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                        {content}
                      </p>
                    ) : Array.isArray(content) ? (
                      <ul className="space-y-2 pl-6">
                        {(content as string[]).map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                            <Badge
                              variant="outline"
                              className="h-5 min-w-[20px] justify-center text-[10px] mt-0.5 shrink-0"
                            >
                              {i + 1}
                            </Badge>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function generateMarkdown(spec: ModuleSpec): string {
  const lines: string[] = [
    `# ${spec.title} — Module Specification\n`,
    `## 🎯 Problem Statement\n`,
    `${spec.problem}\n`,
    `## 💡 Solution\n`,
    `${spec.solution}\n`,
    `## 👥 Use Cases\n`,
    ...(spec.useCases.map((uc, i) => `${i + 1}. ${uc}`)),
    ``,
    `## 🔭 Current Scope\n`,
    ...(spec.currentScope.map(s => `- ${s}`)),
    ``,
    `## 🚀 Future Scope & Scale\n`,
    ...(spec.futureScope.map(s => `- ${s}`)),
    ``,
    `## 💰 Possible Monetisation\n`,
    ...(spec.monetisation.map(s => `- ${s}`)),
    ``,
    `---\n`,
    `*Generated from findoo Admin Panel — ${new Date().toLocaleDateString()}*`,
  ];
  return lines.join("\n");
}
