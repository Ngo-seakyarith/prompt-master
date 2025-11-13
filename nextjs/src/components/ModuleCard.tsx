"use client";

import Link from "next/link";
import { Lock, CheckCircle, PlayCircle, BookOpen, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  content: {
    exercises?: any[];
  };
}

interface UserProgress {
  isCompleted: boolean;
  attempts?: number;
  score?: number;
}

interface ModuleCardProps {
  module: Module;
  progress?: UserProgress;
  isLocked: boolean;
  quizCount?: number;
}

export default function ModuleCard({ module, progress, isLocked, quizCount = 0 }: ModuleCardProps) {
  const exerciseCount = module.content?.exercises?.length || 0;
  const totalActivities = exerciseCount + quizCount;
  
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }
    if (progress?.isCompleted) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (progress && (progress.attempts || 0) > 0) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          <PlayCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-accent/10 text-accent">
        Available
      </Badge>
    );
  };

  const getButtonText = () => {
    if (isLocked) return "Locked";
    if (progress?.isCompleted) return "Review";
    if (progress && (progress.attempts || 0) > 0) return "Continue";
    return "Start";
  };

  const progressPercentage = progress?.isCompleted ? 100 : (progress?.score || 0);

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${
        isLocked ? "opacity-60" : ""
      } ${
        progress && !progress.isCompleted && (progress.attempts || 0) > 0 
          ? "border-primary/20 bg-primary/5" 
          : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isLocked 
              ? "bg-muted" 
              : progress?.isCompleted 
                ? "bg-secondary/10" 
                : progress && (progress.attempts || 0) > 0
                  ? "bg-primary/10"
                  : "bg-accent/10"
          }`}>
            <i className={`${module.icon} text-xl ${
              isLocked
                ? "text-muted-foreground"
                : progress?.isCompleted
                  ? "text-secondary"
                  : progress && (progress.attempts || 0) > 0
                    ? "text-primary"
                    : "text-accent"
            }`}></i>
          </div>
          {getStatusBadge()}
        </div>
        
        <h4 className="text-xl font-semibold mb-2">
          {module.title}
        </h4>
        
        <p className="text-muted-foreground mb-3">
          {isLocked 
            ? "Complete previous modules to unlock"
            : module.description
          }
        </p>

        {/* Content indicators */}
        {!isLocked && totalActivities > 0 && (
          <div className="flex gap-2 mb-4 text-xs">
            {exerciseCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                <BookOpen className="w-3 h-3" />
                <span>{exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}</span>
              </div>
            )}
            {quizCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md">
                <span className="text-sm">🧠</span>
                <span>{quizCount} {quizCount === 1 ? "quiz" : "quizzes"}</span>
              </div>
            )}
          </div>
        )}

        {isLocked && (
          <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="flex items-center text-sm text-destructive">
              <Lock className="w-4 h-4 mr-2" />
              <span>Complete previous modules to unlock</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Modules must be completed sequentially
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Playground Integration Section for Completed Modules */}
        {progress?.isCompleted && !isLocked && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-primary">
                <FlaskConical className="w-4 h-4 mr-2" />
                <span>Test your skills in Playground</span>
              </div>
              <Link href="/playground">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary border-primary hover:bg-primary/10 text-xs px-2 py-1 h-6"
                >
                  Try Now
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Apply what you learned with different AI models
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {progress?.score ? `Score: ${progress.score}/100` : "Not Started"}
          </span>
          {isLocked ? (
            <Button disabled variant="outline">
              {getButtonText()}
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              {progress && (progress.attempts || 0) > 0 && !progress.isCompleted && (
                <Link href="/playground">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:text-primary/80 text-xs px-2 py-1 h-6"
                  >
                    <FlaskConical className="w-3 h-3 mr-1" />
                    Playground
                  </Button>
                </Link>
              )}
              <Link href={`/modules/${module.id}`}>
                <Button
                  variant={progress?.isCompleted ? "outline" : "default"}
                  className={progress?.isCompleted ? "border-secondary text-secondary hover:bg-secondary/10" : ""}
                >
                  {getButtonText()}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
