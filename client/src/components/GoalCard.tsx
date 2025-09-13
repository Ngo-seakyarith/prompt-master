import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Target, Calendar, Award, TrendingUp, MoreVertical, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { safeParseNotes, safeFormatDate } from "@/lib/goalUtils";
import type { Goal } from "@shared/schema";

interface GoalProgress {
  currentValue: number;
  targetValue: number;
  progress: number;
  isCompleted: boolean;
}

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
  onEdit: () => void;
  onDelete: () => void;
  showCelebration?: boolean;
  expired?: boolean;
}

export default function GoalCard({ goal, progress, onEdit, onDelete, showCelebration, expired }: GoalCardProps) {
  const { t } = useTranslation();
  const [celebrationVisible, setCelebrationVisible] = useState(showCelebration);

  const goalMetadata = safeParseNotes(goal.notes);
  const goalType = goalMetadata.type || "module_count";
  const goalTitle = goalMetadata.title || t(`goals.types.${goalType}`);

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "course_completion":
        return <Award className="w-5 h-5 text-green-500" />;
      case "streak":
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case "progress_percentage":
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <Target className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusBadge = () => {
    if (progress.isCompleted) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t("goals.completed")}</Badge>;
    }
    if (expired) {
      return <Badge variant="destructive">{t("goals.expired")}</Badge>;
    }
    return <Badge variant="outline">{t("goals.active")}</Badge>;
  };

  const getProgressDescription = () => {
    switch (goalType) {
      case "course_completion":
        return t("goals.progressDescriptions.courseCompletion", { 
          current: progress.currentValue, 
          target: progress.targetValue 
        });
      case "module_count":
        return t("goals.progressDescriptions.moduleCount", { 
          current: progress.currentValue, 
          target: progress.targetValue 
        });
      case "streak":
        return t("goals.progressDescriptions.streak", { 
          current: progress.currentValue, 
          target: progress.targetValue 
        });
      case "progress_percentage":
        return t("goals.progressDescriptions.progressPercentage", { 
          current: progress.currentValue, 
          target: progress.targetValue 
        });
      default:
        return `${progress.currentValue} / ${progress.targetValue}`;
    }
  };

  const targetDate = safeFormatDate(goal.targetDate);
  const now = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg ${
        progress.isCompleted ? 'border-green-200 dark:border-green-800' : 
        expired ? 'border-red-200 dark:border-red-800' : 
        'border-border'
      }`}
      data-testid={`goal-card-${goal.id}`}
    >
      {celebrationVisible && progress.isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg animate-pulse" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getGoalIcon(goalType)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate" data-testid="goal-title">
                {goalTitle}
              </CardTitle>
              <CardDescription className="mt-1" data-testid="goal-description">
                {goalMetadata.description || goal.notes?.replace(/\{.*\}/, '').trim() || t("goals.noDescription")}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="goal-menu">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} data-testid="goal-edit">
                  <Edit className="w-4 h-4 mr-2" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete} 
                  className="text-red-600 dark:text-red-400"
                  data-testid="goal-delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("common.progress")}</span>
            <span className="font-medium" data-testid="goal-progress-text">
              {getProgressDescription()}
            </span>
          </div>
          
          <Progress 
            value={progress.progress} 
            className="h-2"
            data-testid="goal-progress-bar"
          />
          
          <div className="text-center">
            <span className="text-2xl font-bold text-foreground" data-testid="goal-progress-percentage">
              {Math.round(progress.progress)}%
            </span>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {progress.isCompleted ? (
                <span>{t("goals.completedOn")}</span>
              ) : expired ? (
                <span>{t("goals.expiredOn")}</span>
              ) : (
                <span>{t("goals.targetDate")}</span>
              )}
            </div>
            <span className="font-medium" data-testid="goal-target-date">
              {format(targetDate, "MMM dd, yyyy")}
            </span>
          </div>
          
          {!progress.isCompleted && !expired && (
            <div className="mt-2 text-center">
              <span className={`text-sm font-medium ${
                daysRemaining <= 7 ? 'text-red-600 dark:text-red-400' : 
                daysRemaining <= 30 ? 'text-orange-600 dark:text-orange-400' : 
                'text-green-600 dark:text-green-400'
              }`} data-testid="goal-days-remaining">
                {daysRemaining > 0 ? 
                  t("goals.daysRemaining", { days: daysRemaining }) : 
                  t("goals.overdue")
                }
              </span>
            </div>
          )}
        </div>

        {/* Course Info */}
        {goal.courseId && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{t("goals.relatedCourse")}: {goalMetadata.courseName || goal.courseId}</span>
            </div>
          </div>
        )}

        {/* Achievement Celebration */}
        {progress.isCompleted && celebrationVisible && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{t("goals.congratulations")}</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t("goals.goalCompleted")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}