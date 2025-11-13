"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Target } from "lucide-react";

export default function GoalsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsFormOpen(false);
      setEditingGoal(null);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete goal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
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
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Target className="w-10 h-10" />
              My Goals
            </h1>
            <p className="text-muted-foreground mt-2">
              Set and track your learning goals
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No goals yet</CardTitle>
                <CardDescription className="mb-6">
                  Create your first goal to start tracking your progress
                </CardDescription>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal: any) => {
              const progress = {
                currentValue: goal.currentValue || 0,
                targetValue: goal.targetModulesPerWeek || 1,
                progress: goal.currentValue 
                  ? (goal.currentValue / goal.targetModulesPerWeek) * 100 
                  : 0,
                isCompleted: goal.currentValue >= goal.targetModulesPerWeek,
              };

              const targetDate = new Date(goal.targetDate);
              const now = new Date();
              const expired = targetDate < now && !progress.isCompleted;

              return (
                <GoalCard
                  key={goal.id}
                  goal={{
                    id: goal.id,
                    title: JSON.parse(goal.notes || "{}").title || "Goal",
                    description: JSON.parse(goal.notes || "{}").description,
                    targetValue: goal.targetModulesPerWeek,
                    currentValue: goal.currentValue || 0,
                    targetDate: goal.targetDate,
                    type: JSON.parse(goal.notes || "{}").type || "module_count",
                  }}
                  progress={progress}
                  onEdit={() => handleEditGoal(goal)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  expired={expired}
                />
              );
            })}
          </div>
        )}

        {/* Goal Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingGoal(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </DialogTitle>
              <DialogDescription>
                Set a specific, measurable goal to track your learning progress
              </DialogDescription>
            </DialogHeader>
            <GoalForm
              initialData={editingGoal}
              onSubmit={(data) => createGoalMutation.mutate(data)}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingGoal(null);
              }}
              isLoading={createGoalMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
