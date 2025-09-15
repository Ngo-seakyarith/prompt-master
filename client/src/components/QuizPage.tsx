import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizTaker from "@/components/QuizTaker";
import QuizResults from "@/components/QuizResults";
import type { Quiz, QuizFeedback } from "@shared/schema";

interface QuizPageProps {
  quizId: string;
  onExit?: () => void;
}

enum QuizState {
  TAKING = "taking",
  RESULTS = "results"
}

export default function QuizPage({ quizId, onExit }: QuizPageProps) {
  const { t } = useTranslation();
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
              <span>{t("quiz.loadingQuiz")}</span>
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
              <h3 className="text-lg font-semibold text-destructive mb-2">{t("quiz.loadError")}</h3>
              <p className="text-muted-foreground mb-4">{t("quiz.loadErrorDesc")}</p>
              {onExit && (
                <button onClick={onExit} className="text-primary hover:underline">
                  {t("common.goBack")}
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
            {t(quiz.titleKey)}
          </CardTitle>
          <p className="text-muted-foreground">
            {t(quiz.descriptionKey)}
          </p>
        </CardHeader>
      </Card>

      {/* Quiz Content */}
      {currentState === QuizState.TAKING && (
        <QuizTaker
          quizId={quizId}
          onComplete={handleQuizComplete}
          onExit={onExit}
        />
      )}

      {currentState === QuizState.RESULTS && quizFeedback && (
        <QuizResults
          feedback={quizFeedback}
          quizTitle={t(quiz.titleKey)}
          onRetakeQuiz={handleRetakeQuiz}
          onContinue={onExit}
        />
      )}
    </div>
  );
}