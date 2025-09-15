import { Link } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TextWithAILinks } from "@/components/AIModelLink";

interface Course {
  id: string;
  title: string;
  description: string;
  titleKey?: string;
  descriptionKey?: string;
  icon: string;
  difficulty: string;
  estimatedDuration: string;
  isActive: boolean;
}

interface CourseProgress {
  courseId: string;
  completedModules: number;
  totalModules: number;
  overallProgress: number;
  isEnrolled: boolean;
}

interface CourseCardProps {
  course: Course;
  progress?: CourseProgress;
  moduleCount?: number;
}

export default function CourseCard({ course, progress, moduleCount = 5 }: CourseCardProps) {
  const { t } = useTranslation();

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

  const courseProgress = progress?.overallProgress || 0;
  const isEnrolled = progress?.isEnrolled || false;
  const completedModules = progress?.completedModules || 0;

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg" data-testid={`course-card-${course.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <i className={`${course.icon} text-xl`} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getDifficultyColor(course.difficulty)} data-testid={`badge-difficulty-${course.id}`}>
              {t(`courses.${course.difficulty}`)}
            </Badge>
            {isEnrolled && (
              <Badge variant="secondary" data-testid={`badge-enrolled-${course.id}`}>
                {t("courses.enrolled")}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-xl" data-testid={`title-${course.id}`}>
          {course.titleKey ? t(course.titleKey) : course.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground" data-testid={`description-${course.id}`}>
          <TextWithAILinks text={course.descriptionKey ? t(course.descriptionKey) : course.description} />
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2" data-testid={`module-count-${course.id}`}>
              <i className="fas fa-book-open" />
              {t("courses.moduleCount", { count: moduleCount })}
            </div>
            <div className="flex items-center gap-2" data-testid={`duration-${course.id}`}>
              <i className="fas fa-clock" />
              {course.estimatedDuration}
            </div>
          </div>

          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("courses.courseProgress")}</span>
                <span className="font-medium" data-testid={`progress-text-${course.id}`}>
                  {completedModules}/{moduleCount} {t("modules", { count: moduleCount })}
                </span>
              </div>
              <Progress 
                value={courseProgress} 
                className="h-2" 
                data-testid={`progress-bar-${course.id}`}
              />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(courseProgress)}% {t("common.completed")}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${course.id}`}>
          <Button 
            className="w-full" 
            variant={isEnrolled ? "outline" : "default"}
            data-testid={`button-course-${course.id}`}
          >
            {isEnrolled 
              ? (courseProgress > 0 ? t("courses.continueCourse") : t("courses.startCourse"))
              : t("courses.startCourse")
            }
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}