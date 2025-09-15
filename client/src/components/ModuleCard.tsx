import { Link } from "wouter";
import { Lock, CheckCircle, PlayCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TextWithAILinks } from "@/components/AIModelLink";
import type { Module, UserProgress } from "@shared/schema";

interface ModuleCardProps {
  module: Module;
  progress?: UserProgress;
  isLocked: boolean;
}

export default function ModuleCard({ module, progress, isLocked }: ModuleCardProps) {
  const { t } = useTranslation();
  
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <Lock className="w-3 h-3 mr-1" />
          {t("common.locked")}
        </Badge>
      );
    }
    if (progress?.isCompleted) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t("common.completed")}
        </Badge>
      );
    }
    if (progress && (progress.attempts || 0) > 0) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          <PlayCircle className="w-3 h-3 mr-1" />
          {t("common.inProgress")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-accent/10 text-accent">
        {t("common.available")}
      </Badge>
    );
  };

  const getButtonText = () => {
    if (isLocked) return t("common.locked");
    if (progress?.isCompleted) return t("common.review");
    if (progress && (progress.attempts || 0) > 0) return t("common.continue");
    return t("common.start");
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
      data-testid={`module-card-${module.id}`}
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
        
        <h4 className="text-xl font-semibold mb-2" data-testid={`module-title-${module.id}`}>
          {module.title}
        </h4>
        
        <p className="text-muted-foreground mb-4" data-testid={`module-description-${module.id}`}>
          {isLocked 
            ? t("common.moduleBlockedDesc")
            : <TextWithAILinks text={module.description} />
          }
        </p>

        {isLocked && (
          <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="flex items-center text-sm text-destructive">
              <Lock className="w-4 h-4 mr-2" />
              <span>{t("common.unlockRequirement")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("common.sequentialLearning")}
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{t("common.progress")}</span>
            <span data-testid={`module-progress-${module.id}`}>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground" data-testid={`module-score-${module.id}`}>
            {progress?.score ? `${t("common.score")}: ${progress.score}/100` : t("common.notStarted")}
          </span>
          {isLocked ? (
            <Button
              disabled
              variant="outline"
              data-testid={`module-button-${module.id}`}
            >
              {getButtonText()}
            </Button>
          ) : (
            <Link href={`/modules/${module.id}`}>
              <Button
                variant={progress?.isCompleted ? "outline" : "default"}
                className={progress?.isCompleted ? "border-secondary text-secondary hover:bg-secondary/10" : ""}
                data-testid={`module-button-${module.id}`}
              >
                {getButtonText()}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
