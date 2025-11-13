"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowRight,
  Award,
  Lightbulb
} from "lucide-react";
import Link from "next/link";

interface QuestionResult {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizFeedback {
  score: number;
  percentage?: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  feedback: string;
  questions?: QuestionResult[];
}

interface QuizResultsProps {
  feedback: QuizFeedback;
  quizTitle?: string;
  onRetakeQuiz?: () => void;
  onContinue?: () => void;
  certificateGenerated?: boolean;
}

export default function QuizResults({ 
  feedback, 
  quizTitle, 
  onRetakeQuiz, 
  onContinue,
  certificateGenerated
}: QuizResultsProps) {
  const percentage = feedback.percentage ?? (feedback.correctAnswers / feedback.totalQuestions) * 100;
  const isPassing = percentage >= 80;
  const isExcellent = percentage >= 95;
  const isGood = percentage >= 80;

  const getPerformanceLevel = () => {
    if (isExcellent) return "Excellent!";
    if (isGood) return "Good Job!";
    if (percentage >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getPerformanceColor = () => {
    if (isExcellent) return "text-emerald-600 dark:text-emerald-400";
    if (isGood) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreGradient = () => {
    if (isExcellent) return "from-emerald-500 to-green-500";
    if (isGood) return "from-green-500 to-lime-500";
    if (percentage >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return "Not recorded";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Results Card */}
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getScoreGradient()}`} />
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            {isPassing ? (
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Target className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              {feedback.percentage}%
            </h2>
            <p className={`text-lg font-semibold ${getPerformanceColor()}`}>
              {getPerformanceLevel()}
            </p>
            {quizTitle && (
              <p className="text-muted-foreground">{quizTitle}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {feedback.correctAnswers}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-1" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {feedback.totalQuestions - feedback.correctAnswers}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-1" />
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(feedback.timeSpent)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Time</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quiz Score</span>
              <span className="font-medium">{feedback.score}/{feedback.totalQuestions * 10}</span>
            </div>
            <Progress value={feedback.percentage} className="h-3" />
          </div>

          {/* AI Feedback */}
          {feedback.feedback && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">AI Feedback</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{feedback.feedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Notice */}
          {certificateGenerated && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-200">Certificate Earned!</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      You&apos;ve earned a certificate for completing this course
                    </p>
                  </div>
                </div>
                <Link href="/certificates">
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Status Message */}
          {isPassing ? (
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 font-medium">
                🎉 Congratulations! You passed the quiz!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You can now continue to the next module
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Keep practicing to improve your score
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You need 80% or higher to pass
              </p>
            </div>
          )}

          {/* Question Review (if available) */}
          {feedback.questions && feedback.questions.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Question Review</h3>
                <Accordion type="single" collapsible className="w-full">
                  {feedback.questions.map((question, index) => (
                    <AccordionItem key={index} value={`question-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          {question.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <span className="text-sm">Question {index + 1}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="font-medium">{question.questionText}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">Your answer:</span>
                            <Badge variant={question.isCorrect ? "secondary" : "destructive"}>
                              {question.userAnswer}
                            </Badge>
                          </div>
                          {!question.isCorrect && (
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground">Correct answer:</span>
                              <Badge variant="secondary">{question.correctAnswer}</Badge>
                            </div>
                          )}
                          {question.explanation && (
                            <p className="text-muted-foreground italic mt-2">
                              {question.explanation}
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onRetakeQuiz && (
              <Button onClick={onRetakeQuiz} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            {onContinue && (
              <Button onClick={onContinue} className="flex-1">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
