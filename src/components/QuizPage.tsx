"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizTaker from "@/components/QuizTaker";
import QuizResults from "@/components/QuizResults";
import type { Quiz } from "@/db/schema";

interface QuestionResult {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizFeedback {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  feedback: string;
  percentage?: number;
  timeSpent?: number;
  questions?: QuestionResult[];
}

interface QuizPageProps {
  quizId: string;
  onExit?: () => void;
}

enum QuizState {
  TAKING = "taking",
  RESULTS = "results"
}

export default function QuizPage({ quizId, onExit }: QuizPageProps) {
  const [currentState, setCurrentState] = useState<QuizState>(QuizState.TAKING);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback | null>(null);

  // Fetch quiz details
  const { data: quiz, isLoading: quizLoading } = useQuery<Quiz>({
    queryKey: ["/api/quiz", quizId],
    enabled: !!quizId,
  });

  const handleQuizComplete = (feedback: QuizFeedback) => {
    setQuizFeedback(feedback);
    setCurrentState(QuizState.RESULTS);
  };

  const handleRetakeQuiz = () => {
    setQuizFeedback(null);
    setCurrentState(QuizState.TAKING);
  };

  if (quizLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading quiz...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load quiz</h3>
              <p className="text-muted-foreground mb-4">The quiz could not be loaded. Please try again.</p>
              {onExit && (
                <button onClick={onExit} className="text-primary hover:underline">
                  Go Back
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {quiz.title}
          </CardTitle>
          <p className="text-muted-foreground">
            {quiz.description}
          </p>
        </CardHeader>
      </Card>

      {/* Quiz Content */}
      {currentState === QuizState.TAKING && quiz.questions && (
        <QuizTaker
          questions={quiz.questions as any[]}
          onComplete={handleQuizComplete}
          onExit={onExit}
        />
      )}

      {currentState === QuizState.RESULTS && quizFeedback && (
        <QuizResults
          feedback={quizFeedback}
          quizTitle={quiz.title}
          onRetakeQuiz={handleRetakeQuiz}
          onContinue={onExit}
        />
      )}
    </div>
  );
}
