"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    titleKey: string;
    descriptionKey: string;
    order: number;
    modules?: any[];
  };
  progress?: {
    completed: number;
    total: number;
    percentage: number;
    isEnrolled: boolean;
  };
}

export default function CourseCard({ course, progress }: CourseCardProps) {
  const isEnrolled = progress?.isEnrolled || false;
  const percentage = progress?.percentage || 0;
  const completed = progress?.completed || 0;
  const total = progress?.total || course.modules?.length || 0;

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          {isEnrolled && (
            <Badge variant="secondary">Enrolled</Badge>
          )}
        </div>
        <CardTitle className="text-xl line-clamp-2">{course.titleKey}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {course.descriptionKey}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {total} modules
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              8-10 hours
            </div>
          </div>

          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completed}/{total} modules
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" variant={isEnrolled ? "default" : "outline"}>
            {isEnrolled ? "Continue Learning" : "Start Course"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
