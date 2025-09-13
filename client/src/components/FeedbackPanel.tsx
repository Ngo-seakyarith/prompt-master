import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AssessmentFeedback } from "@shared/schema";

interface FeedbackPanelProps {
  feedback?: AssessmentFeedback;
  prompt: string;
  onApplySuggestions: (suggestion: string) => void;
  onNewExercise: () => void;
}

export default function FeedbackPanel({ 
  feedback, 
  prompt, 
  onApplySuggestions, 
  onNewExercise 
}: FeedbackPanelProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const improveMutation = useMutation({
    mutationFn: async ({ prompt, feedback }: { prompt: string; feedback: AssessmentFeedback }) => {
      const response = await apiRequest("POST", "/api/improve-prompt", { prompt, feedback });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.suggestion) {
        onApplySuggestions(data.suggestion);
      }
    },
  });

  const handleApplySuggestions = async () => {
    if (feedback && prompt) {
      setIsGenerating(true);
      try {
        await improveMutation.mutateAsync({ prompt, feedback });
      } finally {
        setIsGenerating(false);
      }
    }
  };

  if (!feedback) {
    return (
      <Card data-testid="feedback-panel-empty">
        <CardHeader>
          <CardTitle>{t("feedback.assessmentFeedback")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("feedback.writeAndAnalyze")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-secondary";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-secondary";
    if (score >= 60) return "bg-accent";
    return "bg-destructive";
  };

  return (
    <Card data-testid="feedback-panel">
      <CardHeader>
        <CardTitle>{t("feedback.assessmentFeedback")}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("feedback.overallScore")}</span>
            <span className={`text-2xl font-bold ${getScoreColor(feedback.overall_score)}`} data-testid="overall-score">
              {feedback.overall_score}/100
            </span>
          </div>
          <Progress value={feedback.overall_score} className="h-3" />
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          {[
            { label: t("feedback.clarityStructure"), score: feedback.clarity_structure, key: "clarity" },
            { label: t("feedback.contextCompleteness"), score: feedback.context_completeness, key: "context" },
            { label: t("feedback.specificity"), score: feedback.specificity, key: "specificity" },
            { label: t("feedback.actionability"), score: feedback.actionability, key: "actionability" }
          ].map(({ label, score, key }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8" data-testid={`score-${key}`}>
                  {score}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div>
          {feedback.strengths.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-3 text-secondary flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                {t("feedback.strengths")}
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} data-testid={`strength-${index}`}>
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.improvements.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-3 text-accent flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {t("feedback.areasForImprovement")}
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} data-testid={`improvement-${index}`}>
                    • {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-3 text-primary flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                {t("feedback.suggestions")}
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index} data-testid={`suggestion-${index}`}>
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Score Badge */}
        <div className="flex justify-center">
          {feedback.overall_score >= 80 ? (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <i className="fas fa-trophy mr-2"></i>
              {t("feedback.excellentReady")}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-lg px-4 py-2 border-accent text-accent">
              <i className="fas fa-target mr-2"></i>
              {t("feedback.scoreToUnlock")}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleApplySuggestions}
            disabled={isGenerating || improveMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-apply-suggestions"
          >
            {isGenerating || improveMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("common.generating")}
              </>
            ) : (
              t("common.applySuggestions")
            )}
          </Button>
          <Button
            onClick={onNewExercise}
            variant="outline"
            className="flex-1 border-accent text-accent hover:bg-accent/10"
            data-testid="button-new-exercise"
          >
            {t("common.tryNewExercise")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
