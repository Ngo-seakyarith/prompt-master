"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  const completedModules = course.modules?.filter((m: any) => m.userProgress?.isCompleted).length || 0;
  const progressPercentage = course.modules.length > 0 
    ? Math.round((completedModules / course.modules.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{course.titleKey}</h1>
          <p className="text-lg text-muted-foreground mb-4">{course.descriptionKey}</p>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{course.modules.length} Modules</Badge>
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Modules</h2>
          {course.modules.map((module: any, index: number) => {
            const isCompleted = module.userProgress?.isCompleted;
            const score = module.userProgress?.score || 0;

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          Module {index + 1}: {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                        
                        {module.userProgress && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <span>Score: {score}/100</span>
                              <span>Attempts: {module.userProgress.attempts}</span>
                            </div>
                            <Progress value={score} className="max-w-xs" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Link href={`/courses/${courseId}/modules/${module.id}`}>
                      <Button>
                        {isCompleted ? "Review" : "Start"}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
