"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Send, Clock, CheckCircle, Loader2 } from "lucide-react";

interface QuizQuestion {
  id: string;
  questionText: string;
  answerOptions: { text: string }[];
}

interface QuizFeedback {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  feedback: string;
}

interface QuizTakerProps {
  questions: QuizQuestion[];
  onComplete: (feedback: QuizFeedback) => void;
  onExit?: () => void;
  isSubmitting?: boolean;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: number[];
  timeSpent: number;
}

export default function QuizTaker({ 
  questions, 
  onComplete, 
  onExit,
  isSubmitting = false
}: QuizTakerProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    timeSpent: 0,
  });

  const [startTime] = useState(() => Date.now());

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
    if (quizState.answers.length !== questions.length) {
      return;
    }

    // Call the parent's onComplete with the quiz data
    const mockFeedback: QuizFeedback = {
      score: 85,
      totalQuestions: questions.length,
      correctAnswers: Math.floor(questions.length * 0.85),
      feedback: "Good job!",
    };
    onComplete(mockFeedback);
  }, [questions, quizState.answers, onComplete]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLastQuestion = quizState.currentQuestionIndex === totalQuestions - 1;
  const canGoNext = quizState.answers[quizState.currentQuestionIndex] !== undefined;
  const allQuestionsAnswered = quizState.answers.length === questions.length && 
    quizState.answers.every(answer => answer !== undefined);

  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load quiz</h3>
            <p className="text-muted-foreground mb-4">Please try again later</p>
            {onExit && (
              <Button onClick={onExit} variant="outline">
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                Question {quizState.currentQuestionIndex + 1} of {totalQuestions}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatTime(quizState.timeSpent)}</span>
              </div>
            </div>
            {onExit && (
              <Button onClick={onExit} variant="ghost" size="sm">
                Exit
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQuestion?.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <RadioGroup
            value={quizState.answers[quizState.currentQuestionIndex]?.toString() || ""}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            className="space-y-4"
          >
            {currentQuestion?.answerOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
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
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              {allQuestionsAnswered && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>All questions answered</span>
                </div>
              )}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!allQuestionsAnswered || isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!canGoNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz Overview</CardTitle>
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
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Click on any question number to jump to that question
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
