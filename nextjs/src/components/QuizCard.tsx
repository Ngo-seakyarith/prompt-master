"use client"

import Link from "next/link";
import { Clock, Trophy, ChevronRight, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Quiz, QuizAttempt } from "@/db/schema";

interface QuizCardProps {
  quiz: Quiz;
  bestAttempt?: QuizAttempt;
  isLocked?: boolean;
  prerequisitesMet?: boolean;
}

export default function QuizCard({ quiz, bestAttempt, isLocked = false, prerequisitesMet = false }: QuizCardProps) {
  // Fetch quiz attempts count for authenticated users
  const { data: attemptsData } = useQuery<{ count: number }>({
    queryKey: [`/api/quiz-attempts/count/${quiz.id}`],
    enabled: !!bestAttempt, // Only fetch if user has attempted the quiz
  });
  
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <Lock className="w-3 h-3 mr-1" />
          Locked
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
    
    if (prerequisitesMet) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          Available
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        Module Required
      </Badge>
    );
  };

  const getButtonText = () => {
    if (isLocked) return "Locked";
    if (bestAttempt) return "Retake Quiz";
    if (prerequisitesMet) return "Start Quiz";
    return "Complete Exercises";
  };

  const isAccessible = !isLocked && prerequisitesMet;
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
                : prerequisitesMet
                  ? "bg-secondary/10"
                  : "bg-muted"
          }`}>
            <Trophy className={`w-6 h-6 ${
              isLocked
                ? "text-muted-foreground"
                : bestAttempt
                  ? "text-primary"
                  : prerequisitesMet
                    ? "text-secondary"
                    : "text-muted-foreground"
            }`} />
          </div>
          {getStatusBadge()}
        </div>
        
        <h4 className="text-xl font-semibold mb-2" data-testid={`quiz-title-${quiz.id}`}>
          {quiz.title}
        </h4>
        
        <p className="text-muted-foreground mb-4" data-testid={`quiz-description-${quiz.id}`}>
          {isLocked 
            ? "Complete previous modules to unlock this quiz"
            : quiz.description
          }
        </p>

        {!isLocked && !prerequisitesMet && (
          <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-center text-sm text-accent">
              <Clock className="w-4 h-4 mr-2" />
              <span>Complete exercises first</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exercise completion required to unlock quiz
            </p>
          </div>
        )}
        
        {bestAttempt && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Best Score</span>
              <span data-testid={`quiz-best-score-${quiz.id}`}>{bestScore}%</span>
            </div>
            <Progress value={bestScore} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Attempts: </span>
                <span className="font-medium" data-testid={`quiz-attempts-${quiz.id}`}>
                  {attemptsData?.count || 1}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last: </span>
                <span className="font-medium" data-testid={`quiz-last-attempt-${quiz.id}`}>
                  {bestAttempt.createdAt ? new Date(bestAttempt.createdAt).toLocaleDateString() : "Not attempted"}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {bestAttempt ? (
              <span data-testid={`quiz-status-${quiz.id}`}>
                {bestScore >= 80 ? "Passed" : "Can improve"}
              </span>
            ) : (
              <span>Not attempted</span>
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
