/**
 * AdminPatentPage — Renders the TrustCircle IQ™ patent document
 * with markdown rendering and download/print support.
 */
import { useState, useEffect } from "react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, FileText } from "lucide-react";
import patentContent from "@/data/patent-content";

export default function AdminPatentPage() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const rendered = marked.parse(patentContent, { async: false }) as string;
    setHtml(rendered);
  }, []);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const blob = new Blob([patentContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TrustCircle-IQ-Patent.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading">TrustCircle IQ™ Patent</h2>
            <p className="text-xs text-muted-foreground">Provisional patent document — Confidential</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1.5" />
            Download .md
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <article
            className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-heading prose-headings:text-foreground
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-table:text-xs prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2
              prose-td:px-3 prose-td:py-2 prose-td:border-border
              prose-pre:bg-muted prose-pre:text-foreground prose-pre:text-xs
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              print:text-black print:prose-headings:text-black"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
