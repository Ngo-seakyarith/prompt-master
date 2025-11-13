"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CoursesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!session,
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold cursor-pointer">Prompt Engineer</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/playground">
                <Button variant="outline">AI Playground</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">All Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our comprehensive collection of AI and prompt engineering courses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course: any) => {
            const courseProgress = progress.filter(
              (p: any) => p.module.course.id === course.id
            );
            const completed = courseProgress.filter((p: any) => p.isCompleted).length;
            const total = course.modules?.length || 0;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            const isStarted = courseProgress.length > 0;

            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="line-clamp-2">{course.titleKey}</CardTitle>
                      {completed === total && total > 0 && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                      {isStarted && completed < total && (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">
                      {course.descriptionKey}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} />
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{total} modules</span>
                        <span>{completed} completed</span>
                      </div>
                      <Button className="w-full mt-4" variant={isStarted ? "default" : "outline"}>
                        {isStarted ? "Continue" : "Start Course"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
