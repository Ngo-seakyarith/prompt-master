"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock, Check, Clock, Play } from "lucide-react";

interface Module {
  id: string;
  title: string;
  order: number;
}

interface UserProgress {
  moduleId: string;
  isCompleted: boolean;
  attempts?: number;
  score?: number;
}

interface ProgressTrackerProps {
  modules: Module[];
  userProgress: UserProgress[];
}

export default function ProgressTracker({ modules, userProgress }: ProgressTrackerProps) {
  const getModuleProgress = (moduleId: string) => {
    return userProgress.find(p => p.moduleId === moduleId);
  };

  const completedModules = userProgress.filter(p => p.isCompleted).length;
  const totalModules = modules.length;
  const averageScore = userProgress.length > 0 
    ? userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length 
    : 0;

  const totalAttempts = userProgress.reduce((sum, p) => sum + (p.attempts || 0), 0);
  const currentStreak = 7; // Mock streak data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Module Progress */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Module Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {modules.map((module) => {
                const progress = getModuleProgress(module.id);
                const isCompleted = progress?.isCompleted || false;
                const score = progress?.score || 0;
                const isLocked = module.order > 1 && !userProgress.find(p => 
                  modules.find(m => m.order === module.order - 1)?.id === p.moduleId && p.isCompleted
                );

                return (
                  <div key={module.id} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isLocked
                        ? "bg-muted"
                        : isCompleted
                          ? "bg-green-100 dark:bg-green-900"
                          : progress && (progress.attempts || 0) > 0
                            ? "bg-primary/10"
                            : "bg-accent/10"
                    }`}>
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      ) : isCompleted ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : progress && (progress.attempts || 0) > 0 ? (
                        <Clock className="w-5 h-5 text-primary" />
                      ) : (
                        <Play className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          {module.title}
                        </span>
                        <span className={`text-sm font-medium ${
                          isLocked
                            ? "text-muted-foreground"
                            : isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : progress && (progress.attempts || 0) > 0
                                ? "text-primary"
                                : "text-muted-foreground"
                        }`}>
                          {isLocked ? "Locked" : isCompleted ? `${score}/100` : progress ? `${score}/100` : "Not started"}
                        </span>
                      </div>
                      <Progress 
                        value={isCompleted ? 100 : score} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements and Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 ${completedModules > 0 ? "" : "opacity-50"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  completedModules > 0 ? "bg-yellow-100 dark:bg-yellow-900" : "bg-muted"
                }`}>
                  <span className="text-2xl">🏅</span>
                </div>
                <div>
                  <div className="font-medium text-sm">First Steps</div>
                  <div className="text-xs text-muted-foreground">Complete your first module</div>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 ${averageScore >= 90 ? "" : "opacity-50"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  averageScore >= 90 ? "bg-yellow-100 dark:bg-yellow-900" : "bg-muted"
                }`}>
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <div className="font-medium text-sm">High Scorer</div>
                  <div className="text-xs text-muted-foreground">Score 90+ on any module</div>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 ${completedModules === totalModules ? "" : "opacity-50"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  completedModules === totalModules ? "bg-yellow-100 dark:bg-yellow-900" : "bg-muted"
                }`}>
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Course Master</div>
                  <div className="text-xs text-muted-foreground">Complete all modules</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed Modules</span>
                <span className="text-sm font-medium">
                  {completedModules}/{totalModules}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Prompts Written</span>
                <span className="text-sm font-medium">
                  {totalAttempts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-sm font-medium">
                  {averageScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Learning Streak</span>
                <span className="text-sm font-medium">
                  {currentStreak} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
