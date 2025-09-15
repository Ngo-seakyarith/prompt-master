import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, ChevronLeft, ChevronRight, Send, Clock, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QuizQuestionDTO, SubmitQuizRequest, QuizFeedback } from "@shared/schema";

interface QuizTakerProps {
  quizId: string;
  onComplete: (feedback: QuizFeedback) => void;
  onExit?: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: number[];
  timeSpent: number;
  isSubmitting: boolean;
}

export default function QuizTaker({ quizId, onComplete, onExit }: QuizTakerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    timeSpent: 0,
    isSubmitting: false,
  });

  const [startTime] = useState(Date.now());

  // Fetch quiz questions
  const { data: questions, isLoading, error } = useQuery<QuizQuestionDTO[]>({
    queryKey: ["/api/quiz-questions", quizId],
    enabled: !!quizId,
  });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (data: SubmitQuizRequest) => {
      const response = await apiRequest("POST", "/api/quiz-attempts", data);
      return response.json();
    },
    onSuccess: (feedback: QuizFeedback) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz", quizId] });
      onComplete(feedback);
    },
    onError: (error: Error) => {
      toast({
        title: t("quiz.submitError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions?.[quizState.currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const progressPercentage = totalQuestions > 0 ? ((quizState.currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    setQuizState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestionIndex] = answerIndex;
      return {
        ...prev,
        answers: newAnswers,
      };
    });
  }, []);

  const handlePreviousQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(totalQuestions - 1, prev.currentQuestionIndex + 1),
    }));
  }, [totalQuestions]);

  const handleSubmitQuiz = useCallback(() => {
    if (!questions || quizState.answers.length !== questions.length) {
      toast({
        title: t("quiz.incompleteQuiz"),
        description: t("quiz.answerAllQuestions"),
        variant: "destructive",
      });
      return;
    }

    const submitData: SubmitQuizRequest = {
      quizId,
      answers: quizState.answers,
      timeSpent: quizState.timeSpent,
    };

    setQuizState(prev => ({ ...prev, isSubmitting: true }));
    submitQuizMutation.mutate(submitData);
  }, [questions, quizState.answers, quizState.timeSpent, quizId, submitQuizMutation, toast, t]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLastQuestion = quizState.currentQuestionIndex === totalQuestions - 1;
  const canGoNext = quizState.answers[quizState.currentQuestionIndex] !== undefined;
  const allQuestionsAnswered = questions && quizState.answers.length === questions.length && 
    quizState.answers.every(answer => answer !== undefined);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>{t("quiz.loadingQuiz")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">{t("quiz.loadError")}</h3>
            <p className="text-muted-foreground mb-4">{t("quiz.loadErrorDesc")}</p>
            {onExit && (
              <Button onClick={onExit} variant="outline">
                {t("common.goBack")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" data-testid="quiz-taker">
      {/* Header with Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                {t("quiz.questionOf", { 
                  current: quizState.currentQuestionIndex + 1, 
                  total: totalQuestions 
                })}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span data-testid="quiz-timer">{formatTime(quizState.timeSpent)}</span>
              </div>
            </div>
            {onExit && (
              <Button onClick={onExit} variant="ghost" size="sm">
                {t("common.exit")}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("quiz.progress")}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl" data-testid={`question-title-${quizState.currentQuestionIndex}`}>
            {currentQuestion?.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <RadioGroup
            value={quizState.answers[quizState.currentQuestionIndex]?.toString() || ""}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            className="space-y-4"
            data-testid={`question-options-${quizState.currentQuestionIndex}`}
          >
            {currentQuestion?.answerOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
                  data-testid={`option-${index}-${quizState.currentQuestionIndex}`}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-base leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Separator />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePreviousQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="quiz-previous-button"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t("quiz.previousQuestion")}</span>
            </Button>

            <div className="flex items-center space-x-2">
              {allQuestionsAnswered && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t("quiz.allQuestionsAnswered")}</span>
                </div>
              )}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!allQuestionsAnswered || quizState.isSubmitting}
                className="flex items-center space-x-2"
                data-testid="quiz-submit-button"
              >
                {quizState.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{t("quiz.submitting")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t("quiz.submitQuiz")}</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!canGoNext}
                className="flex items-center space-x-2"
                data-testid="quiz-next-button"
              >
                <span>{t("quiz.nextQuestion")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("quiz.quizOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = quizState.answers[index] !== undefined;
              const isCurrent = index === quizState.currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setQuizState(prev => ({ ...prev, currentQuestionIndex: index }))}
                  className={`
                    w-8 h-8 rounded-md text-sm font-medium transition-all
                    ${isCurrent 
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                      : isAnswered 
                        ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200" 
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }
                  `}
                  data-testid={`quiz-overview-${index}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {t("quiz.overviewDesc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}