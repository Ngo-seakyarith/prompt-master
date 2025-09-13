import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import Navigation from "@/components/Navigation";
import CourseCard from "@/components/CourseCard";
import { COURSES, MODULES } from "@/lib/constants";
import type { UserProgress } from "@shared/schema";

export default function CoursesList() {
  const { t } = useTranslation();

  // Fetch user progress to calculate course progress
  const { data: userProgress = [], isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"]
  });

  const calculateCourseProgress = (courseId: string) => {
    const courseModules = MODULES.filter(module => module.courseId === courseId);
    const completedModules = userProgress.filter(progress => 
      progress.isCompleted && courseModules.some(module => module.id === progress.moduleId)
    );
    const totalModules = courseModules.length;
    const overallProgress = totalModules > 0 ? (completedModules.length / totalModules) * 100 : 0;
    const isEnrolled = userProgress.some(progress => 
      courseModules.some(module => module.id === progress.moduleId)
    );

    return {
      courseId,
      completedModules: completedModules.length,
      totalModules,
      overallProgress,
      isEnrolled
    };
  };

  const getModuleCount = (courseId: string) => {
    return MODULES.filter(module => module.courseId === courseId).length;
  };

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="loading-courses">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12" data-testid="courses-header">
          <h1 className="text-4xl font-bold mb-4" data-testid="page-title">
            {t("courses.allCourses")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-subtitle">
            {t("dashboard.heroSubtitle")}
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="courses-grid">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={calculateCourseProgress(course.id)}
              moduleCount={getModuleCount(course.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {COURSES.length === 0 && (
          <div className="text-center py-12" data-testid="empty-courses">
            <div className="w-64 mx-auto mb-6 text-muted-foreground">
              <i className="fas fa-graduation-cap text-6xl mb-4 block" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No courses available</h3>
            <p className="text-muted-foreground">
              Check back later for new learning opportunities.
            </p>
          </div>
        )}

        {/* Course Statistics */}
        {COURSES.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="course-stats">
            <div className="bg-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="total-courses">
                {COURSES.filter(course => course.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Available Courses</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="total-modules">
                {MODULES.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="enrolled-count">
                {COURSES.filter(course => calculateCourseProgress(course.id).isEnrolled).length}
              </div>
              <div className="text-sm text-muted-foreground">Enrolled Courses</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}