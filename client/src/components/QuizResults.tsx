import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
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
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb
} from "lucide-react";
import type { QuizFeedback } from "@shared/schema";
import { useEffect } from "react";
import { Link } from "wouter";

interface QuizResultsProps {
  feedback: QuizFeedback;
  quizTitle?: string;
  onRetakeQuiz?: () => void;
  onContinue?: () => void;
  onViewQuestions?: () => void;
  certificateStatus?: {
    certificateGenerated: boolean;
    moduleCompleted: boolean;
    courseCompleted: boolean;
  };
}

export default function QuizResults({ 
  feedback, 
  quizTitle, 
  onRetakeQuiz, 
  onContinue, 
  onViewQuestions,
  certificateStatus 
}: QuizResultsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const isPassing = feedback.percentage >= 80;
  const isExcellent = feedback.percentage >= 95;
  const isGood = feedback.percentage >= 80;

  // Show toast notifications for quiz completion and certificate generation
  useEffect(() => {
    if (isPassing) {
      // Always show quiz completion toast for passing scores
      toast({
        title: t("quiz.quizCompleted"),
        description: t("quiz.quizCompletedDesc"),
        duration: 5000,
      });

      // Show certificate generation toast if certificate was generated
      if (certificateStatus?.certificateGenerated) {
        setTimeout(() => {
          toast({
            title: t("quiz.certificateGenerated"),
            description: t("quiz.certificateGeneratedDesc"),
            duration: 7000,
            action: (
              <Link href="/certificates" className="text-sm font-medium hover:underline">
                {t("quiz.viewCertificates")}
              </Link>
            ),
          });
        }, 1500); // Delay to show after quiz completion toast
      } else if (certificateStatus?.moduleCompleted) {
        // Show module completion toast if module was completed but no certificate yet
        setTimeout(() => {
          toast({
            title: t("quiz.moduleCompleted"),
            description: t("quiz.moduleCompletedDesc"),
            duration: 5000,
          });
        }, 1500);
      }
    }
  }, [isPassing, certificateStatus, t, toast]);

  const getPerformanceLevel = () => {
    if (isExcellent) return t("quiz.results.excellent");
    if (isGood) return t("quiz.results.good");
    if (feedback.percentage >= 60) return t("quiz.results.fair");
    return t("quiz.results.needsImprovement");
  };

  const getPerformanceColor = () => {
    if (isExcellent) return "text-emerald-600 dark:text-emerald-400";
    if (isGood) return "text-green-600 dark:text-green-400";
    if (feedback.percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreGradient = () => {
    if (isExcellent) return "from-emerald-500 to-green-500";
    if (isGood) return "from-green-500 to-lime-500";
    if (feedback.percentage >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return t("quiz.results.notRecorded");
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}${t("quiz.results.minutes")} ${remainingSeconds}${t("quiz.results.seconds")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" data-testid="quiz-results">
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
            <h2 className="text-3xl font-bold" data-testid="quiz-score">
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
              <p className="text-2xl font-bold text-primary" data-testid="correct-answers">
                {feedback.correctAnswers}
              </p>
              <p className="text-sm text-muted-foreground">{t("quiz.results.correct")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground" data-testid="total-questions">
                {feedback.totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">{t("quiz.results.total")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent" data-testid="time-spent">
                {formatTime(feedback.timeSpent)}
              </p>
              <p className="text-sm text-muted-foreground">{t("quiz.results.timeSpent")}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{t("quiz.results.performanceBreakdown")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("quiz.results.overallScore")}</span>
              <span className="text-sm font-bold">{feedback.overallScore}/100</span>
            </div>
            <Progress value={feedback.overallScore} className="h-3" />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t("quiz.results.accuracy")}</span>
              <Badge variant={isPassing ? "default" : "destructive"}>
                {Math.round((feedback.correctAnswers / feedback.totalQuestions) * 100)}%
              </Badge>
            </div>
            
            {feedback.timeSpent && (
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("quiz.results.averageTimePerQuestion")}</span>
                <Badge variant="outline">
                  {Math.round(feedback.timeSpent / feedback.totalQuestions)}s
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Award className="w-5 h-5" />
                <span>{t("quiz.results.strengths")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {feedback.improvements && feedback.improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-5 h-5" />
                <span>{t("quiz.results.areasForImprovement")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Question Feedback */}
      {feedback.detailedFeedback && feedback.detailedFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("quiz.results.detailedFeedback")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {feedback.detailedFeedback.map((questionFeedback, index) => (
                <AccordionItem key={index} value={`question-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-3">
                      {questionFeedback.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span>
                        {t("quiz.results.questionNumber", { number: questionFeedback.questionIndex + 1 })}
                      </span>
                      <Badge variant={questionFeedback.isCorrect ? "default" : "destructive"} className="ml-auto">
                        {questionFeedback.isCorrect ? t("quiz.results.correct") : t("quiz.results.incorrect")}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {questionFeedback.explanation}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onRetakeQuiz && (
              <Button 
                onClick={onRetakeQuiz} 
                variant="outline" 
                className="flex items-center space-x-2"
                data-testid="retake-quiz-button"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t("quiz.results.retakeQuiz")}</span>
              </Button>
            )}
            
            {onViewQuestions && (
              <Button 
                onClick={onViewQuestions} 
                variant="ghost" 
                className="flex items-center space-x-2"
                data-testid="view-questions-button"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t("quiz.results.reviewQuestions")}</span>
              </Button>
            )}
            
            {onContinue && isPassing && (
              <Button 
                onClick={onContinue} 
                className="flex items-center space-x-2"
                data-testid="continue-button"
              >
                <span>{t("quiz.results.continue")}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {!isPassing && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {t("quiz.results.passingScoreNotMet")}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t("quiz.results.passingScoreRequirement")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}