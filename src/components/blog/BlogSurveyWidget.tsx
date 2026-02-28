import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, LogIn, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useSurveyQuestions,
  useUserSurveySubmitted,
  useSubmitSurvey,
  SurveyQuestion,
} from "@/hooks/useBlogInteractions";

interface Props {
  blogPostId: string;
}

type Answers = Record<string, { optionIds?: string[]; textResponse?: string }>;

export function BlogSurveyWidget({ blogPostId }: Props) {
  const [userId, setUserId] = useState<string>();
  const { data: questions, isLoading } = useSurveyQuestions(blogPostId);
  const { data: hasSubmitted } = useUserSurveySubmitted(blogPostId, userId);
  const submitSurvey = useSubmitSurvey(blogPostId);

  const [answers, setAnswers] = useState<Answers>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  if (isLoading || !questions || questions.length === 0) return null;

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  function setSingleChoice(qId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [qId]: { optionIds: [optionId] } }));
  }

  function toggleMultiChoice(qId: string, optionId: string) {
    setAnswers((prev) => {
      const existing = prev[qId]?.optionIds || [];
      const updated = existing.includes(optionId)
        ? existing.filter((id) => id !== optionId)
        : [...existing, optionId];
      return { ...prev, [qId]: { optionIds: updated } };
    });
  }

  function setTextAnswer(qId: string, text: string) {
    setAnswers((prev) => ({ ...prev, [qId]: { textResponse: text } }));
  }

  async function handleSubmit() {
    if (!userId) {
      toast.error("Please sign in to participate");
      return;
    }

    // Validate required questions
    const missing = questions.filter(
      (q) => q.required && !answers[q.id]
    );
    if (missing.length > 0) {
      toast.error(`Please answer all required questions (${missing.length} remaining)`);
      return;
    }

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, ans]) => ({
        questionId,
        optionIds: ans.optionIds,
        textResponse: ans.textResponse,
      }));
      await submitSurvey.mutateAsync({ answers: formattedAnswers, userId });
      toast.success("Survey submitted! Thank you for participating.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    }
  }

  // Show results view
  if (hasSubmitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 my-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Survey Results</h3>
          <CheckCircle2 className="h-4 w-4 text-chart-2 ml-auto" />
          <span className="text-xs text-chart-2 font-medium">Submitted</span>
        </div>

        <div className="space-y-6">
          {questions.map((q, qi) => {
            const totalResponses = q.options.reduce((s, o) => s + o.response_count, 0);
            return (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {qi + 1}. {q.question_text}
                </p>
                {q.question_type !== "text" ? (
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const pct = totalResponses > 0 ? Math.round((opt.response_count / totalResponses) * 100) : 0;
                      return (
                        <div key={opt.id} className="relative rounded-lg border border-border overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-chart-2/10"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                          <div className="relative flex items-center justify-between px-3 py-2">
                            <span className="text-xs text-card-foreground">{opt.option_text}</span>
                            <span className="text-xs font-semibold text-foreground">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-muted-foreground">{totalResponses} response{totalResponses !== 1 ? "s" : ""}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Text responses collected</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Survey form
  return (
    <div className="rounded-xl border border-border bg-card p-6 my-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
          <BarChart3 className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Participate in this Survey</h3>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Progress value={progressPct} className="flex-1 h-1.5" />
        <span className="text-xs text-muted-foreground shrink-0">
          {answeredCount}/{totalQuestions}
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <QuestionBlock
            key={q.id}
            question={q}
            index={qi}
            answer={answers[q.id]}
            onSingleChoice={(oid) => setSingleChoice(q.id, oid)}
            onMultiChoice={(oid) => toggleMultiChoice(q.id, oid)}
            onTextChange={(text) => setTextAnswer(q.id, text)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        {userId ? (
          <Button
            onClick={handleSubmit}
            disabled={submitSurvey.isPending}
            className="gap-1.5"
          >
            <Send className="h-4 w-4" />
            {submitSurvey.isPending ? "Submitting..." : "Submit Survey"}
          </Button>
        ) : (
          <Button variant="outline" asChild className="gap-1.5">
            <a href="/auth">
              <LogIn className="h-4 w-4" />
              Sign in to participate
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionBlock({
  question,
  index,
  answer,
  onSingleChoice,
  onMultiChoice,
  onTextChange,
}: {
  question: SurveyQuestion;
  index: number;
  answer?: { optionIds?: string[]; textResponse?: string };
  onSingleChoice: (oid: string) => void;
  onMultiChoice: (oid: string) => void;
  onTextChange: (text: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-2"
    >
      <p className="text-sm font-medium text-foreground">
        {index + 1}. {question.question_text}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </p>

      {question.question_type === "single_choice" && (
        <RadioGroup
          value={answer?.optionIds?.[0] || ""}
          onValueChange={onSingleChoice}
          className="space-y-1.5"
        >
          {question.options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <RadioGroupItem value={opt.id} id={opt.id} />
              <Label htmlFor={opt.id} className="text-sm cursor-pointer flex-1">
                {opt.option_text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.question_type === "multi_choice" && (
        <div className="space-y-1.5">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => onMultiChoice(opt.id)}
            >
              <Checkbox
                checked={(answer?.optionIds || []).includes(opt.id)}
                onCheckedChange={() => onMultiChoice(opt.id)}
              />
              <span className="text-sm">{opt.option_text}</span>
            </div>
          ))}
        </div>
      )}

      {question.question_type === "text" && (
        <Textarea
          placeholder="Type your response..."
          value={answer?.textResponse || ""}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          className="text-sm"
        />
      )}
    </motion.div>
  );
}
