import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Module, UserProgress } from "@shared/schema";

interface ModuleCardProps {
  module: Module;
  progress?: UserProgress;
  isLocked: boolean;
  onStart: () => void;
}

export default function ModuleCard({ module, progress, isLocked, onStart }: ModuleCardProps) {
  const getStatusBadge = () => {
    if (isLocked) {
      return <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">Locked</span>;
    }
    if (progress?.isCompleted) {
      return <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">Completed</span>;
    }
    if (progress && (progress.attempts || 0) > 0) {
      return <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">In Progress</span>;
    }
    return <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">Available</span>;
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
          {module.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span data-testid={`module-progress-${module.id}`}>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground" data-testid={`module-score-${module.id}`}>
            {progress?.score ? `Score: ${progress.score}/100` : isLocked ? "Requires 80+ score" : "Not started"}
          </span>
          <Button
            onClick={onStart}
            disabled={isLocked}
            variant={progress?.isCompleted ? "outline" : "default"}
            className={progress?.isCompleted ? "border-secondary text-secondary hover:bg-secondary/10" : ""}
            data-testid={`module-button-${module.id}`}
          >
            {getButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
