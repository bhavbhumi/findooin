/**
 * AIComposeDialog — AI-powered post generation for Enterprise subscribers.
 * Modes: Draft generation, Content repurposing, Auto-suggest (weekly calendar).
 * Streams AI output in real-time, lets user edit before inserting into composer.
 */
import { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Sparkles, Wand2, RefreshCw, Calendar, Loader2, Copy, Check, ArrowRight,
  FileText, TrendingUp,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

interface AIComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string) => void;
}

type Tone = "formal" | "conversational" | "thought-leadership" | "educational";
type Mode = "draft" | "repurpose" | "auto_suggest";

interface AutoSuggestion {
  day: string;
  content: string;
  hashtags: string[];
  category: string;
}

const TONES: { value: Tone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "conversational", label: "Conversational" },
  { value: "thought-leadership", label: "Thought Leadership" },
  { value: "educational", label: "Educational" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-compose`;

async function streamAI({
  mode, prompt, tone, role, sourceContent, onDelta, onDone, onError,
}: {
  mode: Mode; prompt: string; tone: Tone; role: string;
  sourceContent?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        mode,
        prompt,
        tone,
        role,
        source_content: sourceContent,
      }),
    });

    if (resp.status === 429) { onError("AI rate limit exceeded. Try again shortly."); return; }
    if (resp.status === 402) { onError("AI credits exhausted. Add funds in Settings."); return; }
    if (!resp.ok || !resp.body) { onError("AI service unavailable"); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIdx: number;
      while ((nlIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nlIdx);
        buffer = buffer.slice(nlIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e: any) {
    onError(e.message || "Failed to generate content");
  }
}

export function AIComposeDialog({ open, onOpenChange, onInsert }: AIComposeDialogProps) {
  const { activeRole } = useRole();
  const [mode, setMode] = useState<Mode>("draft");
  const [prompt, setPrompt] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [tone, setTone] = useState<Tone>("conversational");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState<AutoSuggestion[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (mode === "draft" && !prompt.trim()) { toast.error("Enter a topic or prompt."); return; }
    if (mode === "repurpose" && !sourceContent.trim()) { toast.error("Paste content to repurpose."); return; }

    setGenerating(true);
    setOutput("");
    setSuggestions([]);

    if (mode === "auto_suggest") {
      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ mode, prompt, tone, role: activeRole }),
        });
        if (!resp.ok) { toast.error("Failed to generate suggestions"); setGenerating(false); return; }
        const data = await resp.json();
        try {
          const parsed = JSON.parse(data.suggestions);
          setSuggestions(Array.isArray(parsed) ? parsed : parsed.suggestions || []);
        } catch {
          setSuggestions([]);
          toast.error("Could not parse suggestions");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to generate suggestions");
      }
      setGenerating(false);
      return;
    }

    let result = "";
    await streamAI({
      mode,
      prompt: mode === "repurpose" ? "" : prompt,
      tone,
      role: activeRole || "intermediary",
      sourceContent: mode === "repurpose" ? sourceContent : undefined,
      onDelta: (chunk) => {
        result += chunk;
        setOutput(result);
      },
      onDone: () => setGenerating(false),
      onError: (msg) => { toast.error(msg); setGenerating(false); },
    });
  }, [mode, prompt, sourceContent, tone, activeRole]);

  const handleInsert = () => {
    if (!output.trim()) return;
    onInsert(output);
    onOpenChange(false);
    setOutput("");
    setPrompt("");
    setSourceContent("");
    toast.success("AI content inserted into composer!");
  };

  const handleInsertSuggestion = (suggestion: AutoSuggestion) => {
    const hashStr = suggestion.hashtags?.map(h => `#${h.replace('#', '')}`).join(" ") || "";
    const full = suggestion.content + (hashStr ? `\n\n${hashStr}` : "");
    onInsert(full);
    onOpenChange(false);
    toast.success(`${suggestion.day} post inserted!`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Compose
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Enterprise
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Generate professional posts with AI — draft, repurpose content, or plan your week.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setOutput(""); setSuggestions([]); }} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="draft" className="text-xs gap-1">
              <Wand2 className="h-3 w-3" /> Draft
            </TabsTrigger>
            <TabsTrigger value="repurpose" className="text-xs gap-1">
              <RefreshCw className="h-3 w-3" /> Repurpose
            </TabsTrigger>
            <TabsTrigger value="auto_suggest" className="text-xs gap-1">
              <Calendar className="h-3 w-3" /> Weekly
            </TabsTrigger>
          </TabsList>

          {/* Draft mode */}
          <TabsContent value="draft" className="mt-3 space-y-3 flex-1">
            <div className="space-y-2">
              <Label className="text-xs">What should the post be about?</Label>
              <Input
                placeholder="e.g., SEBI's new MF categorization rules and what it means for distributors"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">Tone:</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Repurpose mode */}
          <TabsContent value="repurpose" className="mt-3 space-y-3 flex-1">
            <div className="space-y-2">
              <Label className="text-xs">Paste article, report, or research content</Label>
              <Textarea
                placeholder="Paste your content here — we'll turn it into a concise, engaging post..."
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                rows={5}
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">Tone:</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Auto-suggest mode */}
          <TabsContent value="auto_suggest" className="mt-3 space-y-3 flex-1">
            <div className="space-y-2">
              <Label className="text-xs">Topics you'd like to cover this week</Label>
              <Input
                placeholder="e.g., equity markets, SIP strategies, regulatory updates"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full gap-2 mt-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : mode === "auto_suggest" ? "Generate Weekly Plan" : "Generate Post"}
        </Button>

        {/* Output area — draft/repurpose */}
        {output && (mode === "draft" || mode === "repurpose") && (
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Generated Content</Label>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[200px]">
              <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3 text-sm whitespace-pre-wrap">
                {output}
                {generating && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />}
              </div>
            </ScrollArea>
            {!generating && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={handleGenerate}>
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
                <Button size="sm" className="flex-1 gap-1 text-xs" onClick={handleInsert}>
                  <ArrowRight className="h-3 w-3" /> Use in Post
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Output area — auto_suggest */}
        {suggestions.length > 0 && mode === "auto_suggest" && (
          <ScrollArea className="max-h-[300px] mt-2">
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{s.day}</Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">{s.category?.replace("_", " ")}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => handleInsertSuggestion(s)}
                    >
                      <ArrowRight className="h-3 w-3" /> Use
                    </Button>
                  </div>
                  <p className="text-xs text-foreground whitespace-pre-wrap">{s.content}</p>
                  {s.hashtags && (
                    <div className="flex flex-wrap gap-1">
                      {s.hashtags.map((h, j) => (
                        <Badge key={j} variant="secondary" className="text-[9px] bg-accent/10 text-accent">
                          #{h.replace("#", "")}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
