"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";

interface AssessmentFeedback {
  overall_score: number;
  clarity_structure: number;
  context_completeness: number;
  specificity: number;
  actionability: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

interface FeedbackPanelProps {
  feedback?: AssessmentFeedback;
  onApplySuggestions: () => void;
  onNewExercise: () => void;
  isImproving?: boolean;
}

export default function FeedbackPanel({ 
  feedback, 
  onApplySuggestions, 
  onNewExercise,
  isImproving = false
}: FeedbackPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  if (!feedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Write a prompt and click &ldquo;Analyze&rdquo; to get detailed feedback</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Feedback</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(feedback.overall_score)}`}>
              {feedback.overall_score}/100
            </span>
          </div>
          <Progress value={feedback.overall_score} className="h-3" />
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          {[
            { label: "Clarity & Structure", score: feedback.clarity_structure, key: "clarity" },
            { label: "Context Completeness", score: feedback.context_completeness, key: "context" },
            { label: "Specificity", score: feedback.specificity, key: "specificity" },
            { label: "Actionability", score: feedback.actionability, key: "actionability" }
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
                <span className="text-sm font-medium w-8">
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
              <h5 className="font-medium mb-3 text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Strengths
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.improvements.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-3 text-yellow-600 dark:text-yellow-400 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Areas for Improvement
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index}>
                    • {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-3 text-blue-600 dark:text-blue-400 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggestions
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>
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
              🏆 Excellent! Ready for next module
            </Badge>
          ) : (
            <Badge variant="outline" className="text-lg px-4 py-2 border-yellow-600 text-yellow-600">
              🎯 Score 80+ to unlock next module
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={onApplySuggestions}
            disabled={isImproving}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isImproving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Apply Suggestions"
            )}
          </Button>
          <Button
            onClick={onNewExercise}
            variant="outline"
            className="flex-1"
          >
            Try New Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
