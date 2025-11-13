"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import PromptEditor from "@/components/PromptEditor";
import FeedbackPanel from "@/components/FeedbackPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Trophy, Target } from "lucide-react";

interface ModuleDetailPageProps {
  params: {
    id: string;
  };
}

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const router = useRouter();
  const moduleId = params.id;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercisePrompts, setExercisePrompts] = useState<Record<number, string>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<number, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: module, isLoading } = useQuery({
    queryKey: [`/api/modules/${moduleId}`],
    queryFn: async () => {
      const res = await fetch(`/api/modules/${moduleId}`);
      if (!res.ok) throw new Error("Failed to fetch module");
      return res.json();
    },
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const assessMutation = useMutation({
    mutationFn: async (data: { prompt: string; moduleId: string; exerciseIndex: number }) => {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Assessment failed");
      return res.json();
    },
    onSuccess: (feedback) => {
      setExerciseFeedback(prev => ({
        ...prev,
        [currentExerciseIndex]: feedback
      }));
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = (prompt: string) => {
    setIsAnalyzing(true);
    assessMutation.mutate({ prompt, moduleId, exerciseIndex: currentExerciseIndex });
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

  if (!module) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Module Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested module could not be found.</p>
            <Link href="/courses">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentProgress = userProgress.find((p: any) => p.moduleId === moduleId);
  const exercises = [
    {
      title: "Exercise 1: Basic Prompting",
      description: "Write a clear and specific prompt for a given task",
      template: "Create a prompt that asks the AI to...",
    }
  ];

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground">
            Courses
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href={`/courses/${module.courseId}`} className="text-muted-foreground hover:text-foreground">
            Course
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium">{module.title}</span>
        </div>

        {/* Module Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Module {module.order}</Badge>
                  <CardTitle className="text-3xl">{module.title}</CardTitle>
                  <p className="text-muted-foreground mt-2">{module.description}</p>
                </div>
              </div>
              {currentProgress?.isCompleted && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Trophy className="w-5 h-5 mr-2" />
                  Completed
                </Badge>
              )}
            </div>

            {currentProgress && (
              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentProgress.score || 0}%</span>
                </div>
                <Progress value={currentProgress.score || 0} className="h-3" />
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Module Content */}
        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{module.description}</p>
                  <h3>What you&apos;ll learn:</h3>
                  <ul>
                    <li>Core concepts of prompt engineering</li>
                    <li>Best practices for writing effective prompts</li>
                    <li>Common pitfalls to avoid</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PromptEditor
                exercise={currentExercise}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
              <FeedbackPanel
                feedback={exerciseFeedback[currentExerciseIndex]}
                onApplySuggestions={() => {}}
                onNewExercise={() => setCurrentExerciseIndex(i => (i + 1) % exercises.length)}
              />
            </div>

            {/* Exercise Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentExerciseIndex(i => Math.max(0, i - 1))}
                disabled={currentExerciseIndex === 0}
              >
                Previous Exercise
              </Button>
              <span className="text-sm text-muted-foreground">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </span>
              <Button
                onClick={() => setCurrentExerciseIndex(i => Math.min(exercises.length - 1, i + 1))}
                disabled={currentExerciseIndex === exercises.length - 1}
              >
                Next Exercise
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Complete the exercises to unlock the quiz
                  </p>
                  <Button disabled>Start Quiz</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
