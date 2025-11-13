"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Target, Calendar, Award, TrendingUp, MoreVertical, Edit, Trash2, Clock } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  targetDate: string;
  type: string;
}

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
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
    }
    if (expired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg ${
        progress.isCompleted ? 'border-green-200 dark:border-green-800' : 
        expired ? 'border-red-200 dark:border-red-800' : 
        'border-border'
      }`}
    >
      {showCelebration && progress.isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg animate-pulse" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getGoalIcon(goal.type)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {goal.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {goal.description || "No description"}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete} 
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {progress.currentValue} / {progress.targetValue}
            </span>
          </div>
          
          <Progress 
            value={progress.progress} 
            className={`h-2 ${
              progress.isCompleted ? 'bg-green-100 [&>div]:bg-green-500' : ''
            }`}
          />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            {!progress.isCompleted && !expired && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
                </span>
              </div>
            )}
            
            {progress.isCompleted && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                🎉 Goal achieved!
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
