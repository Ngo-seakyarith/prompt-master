import { Link } from "wouter";
import { Clock, Trophy, ChevronRight, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Quiz, QuizAttempt } from "@shared/schema";

interface QuizCardProps {
  quiz: Quiz;
  bestAttempt?: QuizAttempt;
  isLocked?: boolean;
  moduleCompleted?: boolean;
}

export default function QuizCard({ quiz, bestAttempt, isLocked = false, moduleCompleted = false }: QuizCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Fetch quiz attempts count for authenticated users
  const { data: attemptsData } = useQuery<{ count: number }>({
    queryKey: ["/api/quiz-attempts/count", quiz.id],
    enabled: !!user && !!bestAttempt, // Only fetch if user is logged in and has attempted the quiz
  });
  
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <Lock className="w-3 h-3 mr-1" />
          {t("common.locked")}
        </Badge>
      );
    }
    
    if (bestAttempt) {
      const percentage = Math.round((bestAttempt.score / bestAttempt.maxScore) * 100);
      const isPassing = percentage >= 80;
      
      return (
        <Badge 
          variant="outline" 
          className={isPassing 
            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
            : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
          }
        >
          <Trophy className="w-3 h-3 mr-1" />
          {percentage}%
        </Badge>
      );
    }
    
    if (moduleCompleted) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          {t("quiz.available")}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        {t("quiz.moduleRequired")}
      </Badge>
    );
  };

  const getButtonText = () => {
    if (isLocked) return t("common.locked");
    if (bestAttempt) return t("quiz.retakeQuiz");
    if (moduleCompleted) return t("quiz.startQuiz");
    return t("quiz.completeModule");
  };

  const isAccessible = !isLocked && moduleCompleted;
  const bestScore = bestAttempt ? Math.round((bestAttempt.score / bestAttempt.maxScore) * 100) : 0;

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${
        isLocked ? "opacity-60" : ""
      } ${
        bestAttempt ? "border-primary/20 bg-primary/5" : ""
      }`}
      data-testid={`quiz-card-${quiz.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isLocked 
              ? "bg-muted" 
              : bestAttempt
                ? "bg-primary/10"
                : moduleCompleted
                  ? "bg-secondary/10"
                  : "bg-muted"
          }`}>
            <Trophy className={`w-6 h-6 ${
              isLocked
                ? "text-muted-foreground"
                : bestAttempt
                  ? "text-primary"
                  : moduleCompleted
                    ? "text-secondary"
                    : "text-muted-foreground"
            }`} />
          </div>
          {getStatusBadge()}
        </div>
        
        <h4 className="text-xl font-semibold mb-2" data-testid={`quiz-title-${quiz.id}`}>
          {t(quiz.titleKey)}
        </h4>
        
        <p className="text-muted-foreground mb-4" data-testid={`quiz-description-${quiz.id}`}>
          {isLocked 
            ? t("quiz.quizLockedDesc")
            : t(quiz.descriptionKey)
          }
        </p>

        {!isLocked && !moduleCompleted && (
          <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-center text-sm text-accent">
              <Clock className="w-4 h-4 mr-2" />
              <span>{t("quiz.completeModuleFirst")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("quiz.moduleCompletionRequired")}
            </p>
          </div>
        )}
        
        {bestAttempt && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{t("quiz.bestScore")}</span>
              <span data-testid={`quiz-best-score-${quiz.id}`}>{bestScore}%</span>
            </div>
            <Progress value={bestScore} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t("quiz.attempts")}: </span>
                <span className="font-medium" data-testid={`quiz-attempts-${quiz.id}`}>
                  {attemptsData?.count || 1}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("quiz.lastAttempt")}: </span>
                <span className="font-medium" data-testid={`quiz-last-attempt-${quiz.id}`}>
                  {bestAttempt.createdAt ? new Date(bestAttempt.createdAt).toLocaleDateString() : t("quiz.notAttempted")}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {bestAttempt ? (
              <span data-testid={`quiz-status-${quiz.id}`}>
                {bestScore >= 80 ? t("quiz.passed") : t("quiz.canImprove")}
              </span>
            ) : (
              <span>{t("quiz.notAttempted")}</span>
            )}
          </div>
          
          {isAccessible ? (
            <Link href={`/quiz/${quiz.id}`}>
              <Button
                variant={bestAttempt ? "outline" : "default"}
                className="group"
                data-testid={`quiz-button-${quiz.id}`}
              >
                {getButtonText()}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              variant="outline"
              data-testid={`quiz-button-${quiz.id}`}
            >
              {getButtonText()}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}