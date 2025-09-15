import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import Navigation from "@/components/Navigation";
import ModuleCard from "@/components/ModuleCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { COURSES, MODULES } from "@/lib/constants";
import type { UserProgress } from "@shared/schema";

interface CourseDetailProps {
  courseId: string;
}

export default function CourseDetail({ courseId }: CourseDetailProps) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  // Find the course
  const course = COURSES.find(c => c.id === courseId);
  
  // Get modules for this course
  const courseModules = MODULES.filter(module => module.courseId === courseId);

  // Fetch user progress
  const { data: userProgress = [], isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"]
  });

  // Calculate course progress
  const calculateCourseProgress = () => {
    const completedModules = userProgress.filter(progress => 
      progress.isCompleted && courseModules.some(module => module.id === progress.moduleId)
    );
    const totalModules = courseModules.length;
    const overallProgress = totalModules > 0 ? (completedModules.length / totalModules) * 100 : 0;
    const isEnrolled = userProgress.some(progress => 
      courseModules.some(module => module.id === progress.moduleId)
    );

    return {
      completedModules: completedModules.length,
      totalModules,
      overallProgress,
      isEnrolled
    };
  };

  const getModuleProgress = (moduleId: string) => {
    return userProgress.find(p => p.moduleId === moduleId);
  };

  const isModuleLocked = (module: typeof courseModules[0]) => {
    // All modules are unlocked - no restrictions
    return false;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="course-not-found">
            <h1 className="text-4xl font-bold mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested course could not be found.</p>
            <Link href="/courses">
              <Button data-testid="back-to-courses-button">
                <i className="fas fa-arrow-left mr-2" />
                {t("courses.backToCourses")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="loading-course">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  const courseProgress = calculateCourseProgress();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6" data-testid="breadcrumb">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground">
            {t("courses.allCourses")}
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium">
            {course.titleKey ? t(course.titleKey) : course.title}
          </span>
        </div>

        {/* Course Header */}
        <Card className="mb-8" data-testid="course-header">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 rounded-lg bg-primary/10 text-primary">
                <i className={`${course.icon} text-2xl`} />
              </div>
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(course.difficulty)} data-testid="course-difficulty">
                  {t(`courses.${course.difficulty}`)}
                </Badge>
                {courseProgress.isEnrolled && (
                  <Badge variant="secondary" data-testid="enrolled-badge">
                    {t("courses.enrolled")}
                  </Badge>
                )}
              </div>
            </div>
            
            <CardTitle className="text-3xl" data-testid="course-title">
              {course.titleKey ? t(course.titleKey) : course.title}
            </CardTitle>
            <CardDescription className="text-lg" data-testid="course-description">
              {course.descriptionKey ? t(course.descriptionKey) : course.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3" data-testid="course-modules">
                <i className="fas fa-book-open text-muted-foreground" />
                <span>
                  <strong>{courseModules.length}</strong> {t("courses.courseModules")}
                </span>
              </div>
              <div className="flex items-center gap-3" data-testid="course-duration">
                <i className="fas fa-clock text-muted-foreground" />
                <span>
                  <strong>{course.estimatedDuration}</strong> {t("courses.duration")}
                </span>
              </div>
              <div className="flex items-center gap-3" data-testid="course-difficulty-info">
                <i className="fas fa-signal text-muted-foreground" />
                <span>
                  <strong>{t(`courses.${course.difficulty}`)}</strong> {t("courses.difficulty")}
                </span>
              </div>
            </div>

            {courseProgress.isEnrolled && (
              <div className="space-y-2" data-testid="course-progress">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t("courses.courseProgress")}</span>
                  <span className="text-sm text-muted-foreground">
                    {courseProgress.completedModules}/{courseProgress.totalModules} {t("common.completed")}
                  </span>
                </div>
                <Progress value={courseProgress.overallProgress} className="h-3" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(courseProgress.overallProgress)}% {t("common.completed")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" data-testid="modules-title">
            {t("courses.courseModules")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="modules-grid">
            {courseModules
              .sort((a, b) => a.order - b.order)
              .map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  progress={getModuleProgress(module.id)}
                  isLocked={isModuleLocked(module)}
                />
              ))}
          </div>
        </div>

        {/* Empty State */}
        {courseModules.length === 0 && (
          <div className="text-center py-12" data-testid="empty-modules">
            <div className="w-64 mx-auto mb-6 text-muted-foreground">
              <i className="fas fa-book-open text-6xl mb-4 block" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No modules available</h3>
            <p className="text-muted-foreground">
              This course doesn't have any modules yet.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center" data-testid="action-buttons">
          <Link href="/courses">
            <Button variant="outline" data-testid="back-button">
              <i className="fas fa-arrow-left mr-2" />
              {t("courses.backToCourses")}
            </Button>
          </Link>
          {courseModules.length > 0 && (
            <Link href={`/modules/${courseModules[0].id}`}>
              <Button data-testid="start-button">
                {courseProgress.isEnrolled 
                  ? (courseProgress.overallProgress > 0 ? t("courses.continueCourse") : t("courses.startCourse"))
                  : t("courses.startCourse")
                }
                <i className="fas fa-arrow-right ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}