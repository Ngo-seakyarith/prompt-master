import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";
import UnauthorizedState from "@/components/UnauthorizedState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, TrendingUp, Calendar, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { safeParseNotes, safeFormatDate, safeGetNumber } from "@/lib/goalUtils";
import { MODULES } from "@/lib/constants";
import type { Goal, UserProgress } from "@shared/schema";

export default function Goals() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const queryClient = useQueryClient();

  // Fetch user goals
  const { data: goals = [], isLoading: goalsLoading, isError: goalsError, error: goalsErrorData } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
    retry: false
  });

  // Fetch user progress for goal calculations
  const { data: userProgress = [], isError: progressError } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
    retry: false
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await apiRequest("POST", "/api/goals", goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowCreateDialog(false);
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setEditingGoal(null);
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const handleCreateGoal = (goalData: any) => {
    createGoalMutation.mutate(goalData);
  };

  const handleUpdateGoal = (goalData: any) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, updates: goalData });
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm(t("goals.confirmDelete"))) {
      deleteGoalMutation.mutate(id);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  // Calculate goal progress using authoritative MODULES mapping
  const calculateGoalProgress = (goal: Goal) => {
    const goalMetadata = safeParseNotes(goal.notes);
    const goalType = goalMetadata.type || "module_count";
    
    let currentValue = 0;
    let targetValue = safeGetNumber(goal.targetModulesPerWeek, 1);
    let isCompleted = false;

    switch (goalType) {
      case "course_completion":
        if (goal.courseId) {
          // Use authoritative MODULES mapping instead of brittle startsWith
          const courseModules = MODULES.filter(m => m.courseId === goal.courseId);
          const completedModules = courseModules.filter(m => 
            userProgress.find(p => p.moduleId === m.id)?.isCompleted
          );
          currentValue = completedModules.length;
          targetValue = courseModules.length;
          isCompleted = currentValue >= targetValue;
        }
        break;
      
      case "module_count":
        if (goal.courseId) {
          // Course-specific module count
          const courseModules = MODULES.filter(m => m.courseId === goal.courseId);
          const completedModules = courseModules.filter(m => 
            userProgress.find(p => p.moduleId === m.id)?.isCompleted
          );
          currentValue = completedModules.length;
        } else {
          // Global module count
          const completedModules = userProgress.filter(p => p.isCompleted);
          currentValue = completedModules.length;
        }
        isCompleted = currentValue >= targetValue;
        break;

      case "progress_percentage":
        if (goal.courseId) {
          const courseModules = MODULES.filter(m => m.courseId === goal.courseId);
          const completedModules = courseModules.filter(m => 
            userProgress.find(p => p.moduleId === m.id)?.isCompleted
          );
          const totalModules = courseModules.length;
          currentValue = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;
          isCompleted = currentValue >= targetValue;
        }
        break;

      case "streak":
        // For streak goals, use metadata or calculate based on recent activity
        currentValue = goalMetadata.currentStreak || 0;
        isCompleted = currentValue >= targetValue;
        break;
    }

    return {
      currentValue,
      targetValue,
      progress: targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0,
      isCompleted
    };
  };

  // Filter goals by status
  const activeGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal);
    const now = new Date();
    const targetDate = safeFormatDate(goal.targetDate);
    return !progress.isCompleted && targetDate >= now;
  });

  const completedGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal);
    return progress.isCompleted;
  });

  const expiredGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal);
    const now = new Date();
    const targetDate = safeFormatDate(goal.targetDate);
    return !progress.isCompleted && targetDate < now;
  });

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  // Handle authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <UnauthorizedState 
          title={t("goals.title")}
          description={t("auth.loginRequiredDescription")}
        />
      </div>
    );
  }

  // Handle API errors (including potential 401s that slip through)
  if ((goalsError || progressError) && !goalsLoading) {
    const errorMessage = goalsErrorData?.message;
    if (errorMessage?.includes('401') || errorMessage?.includes('Unauthorized')) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <UnauthorizedState 
            title={t("goals.title")}
            description={t("auth.loginRequiredDescription")}
          />
        </div>
      );
    }
  }

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="goals-title">
              {t("goals.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="goals-subtitle">
              {t("goals.subtitle")}
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" data-testid="button-create-goal">
                <Plus className="w-4 h-4" />
                {t("goals.createGoal")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("goals.createGoal")}</DialogTitle>
                <DialogDescription>
                  {t("goals.createGoalDescription")}
                </DialogDescription>
              </DialogHeader>
              <GoalForm
                onSubmit={handleCreateGoal}
                onCancel={() => setShowCreateDialog(false)}
                isLoading={createGoalMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stats-active">
                    {activeGoals.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("goals.activeGoals")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stats-completed">
                    {completedGoals.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("goals.completedGoals")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stats-total">
                    {goals.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("goals.totalGoals")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stats-expired">
                    {expiredGoals.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("goals.expiredGoals")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3" data-testid="goals-tabs">
            <TabsTrigger value="active" data-testid="tab-active">
              {t("goals.active")} ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              {t("goals.completed")} ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="expired" data-testid="tab-expired">
              {t("goals.expired")} ({expiredGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeGoals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("goals.noActiveGoals")}</h3>
                  <p className="text-muted-foreground mb-4">{t("goals.noActiveGoalsDescription")}</p>
                  <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-goal">
                    {t("goals.createFirstGoal")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    progress={calculateGoalProgress(goal)}
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedGoals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("goals.noCompletedGoals")}</h3>
                  <p className="text-muted-foreground">{t("goals.noCompletedGoalsDescription")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    progress={calculateGoalProgress(goal)}
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    showCelebration
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4 mt-6">
            {expiredGoals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("goals.noExpiredGoals")}</h3>
                  <p className="text-muted-foreground">{t("goals.noExpiredGoalsDescription")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    progress={calculateGoalProgress(goal)}
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    expired
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Goal Dialog */}
        <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("goals.editGoal")}</DialogTitle>
              <DialogDescription>
                {t("goals.editGoalDescription")}
              </DialogDescription>
            </DialogHeader>
            {editingGoal && (
              <GoalForm
                initialData={editingGoal}
                onSubmit={handleUpdateGoal}
                onCancel={() => setEditingGoal(null)}
                isLoading={updateGoalMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}