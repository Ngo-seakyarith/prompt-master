import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import CourseCard from "@/components/CourseCard";
import GoalCard from "@/components/GoalCard";
import PromptEditor from "@/components/PromptEditor";
import FeedbackPanel from "@/components/FeedbackPanel";
import ProgressTracker from "@/components/ProgressTracker";
import UnauthorizedState from "@/components/UnauthorizedState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { COURSES, MODULES } from "@/lib/constants";
import { safeParseNotes, safeGetNumber } from "@/lib/goalUtils";
import { Target, Plus, TrendingUp } from "lucide-react";
import type { UserProgress, AssessmentFeedback, Goal } from "@shared/schema";

export default function Dashboard() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState<AssessmentFeedback | undefined>();
  const [activeModuleId, setActiveModuleId] = useState<string>("basic-prompting");
  
  const queryClient = useQueryClient();

  // Fetch user progress
  const { data: userProgress = [], isLoading: progressLoading, isError: progressError, error: progressErrorData } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
    retry: false
  });

  // Fetch user goals
  const { data: goals = [], isError: goalsError, error: goalsErrorData } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
    retry: false
  });

  // Assessment mutation
  const assessMutation = useMutation({
    mutationFn: async ({ prompt, moduleId }: { prompt: string; moduleId: string }) => {
      const response = await apiRequest("POST", "/api/assess", { prompt, moduleId });
      return response.json();
    },
    onSuccess: (feedback: AssessmentFeedback) => {
      setCurrentFeedback(feedback);
      // Invalidate progress to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
    onError: (error) => {
      console.error("Assessment error:", error);
    },
  });

  const handleAnalyzePrompt = (prompt: string) => {
    setCurrentPrompt(prompt);
    assessMutation.mutate({ prompt, moduleId: activeModuleId });
  };

  const handleApplySuggestions = (suggestion: string) => {
    setCurrentPrompt(suggestion);
    setCurrentFeedback(undefined);
  };

  const handleNewExercise = () => {
    setCurrentPrompt("");
    setCurrentFeedback(undefined);
  };

  // Calculate course progress
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

  // Get enrolled courses
  const enrolledCourses = COURSES.filter(course => 
    calculateCourseProgress(course.id).isEnrolled
  );

  // Calculate overall statistics
  const totalCourses = COURSES.length;
  const completedModules = userProgress.filter(p => p.isCompleted).length;
  const totalModules = MODULES.length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  // Calculate goal progress using authoritative MODULES mapping and safe parsing
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
    const targetDate = new Date(goal.targetDate);
    return !progress.isCompleted && targetDate >= now;
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
          title={t("dashboard.heroTitle")}
          description={t("auth.loginRequiredDescription")}
        />
      </div>
    );
  }

  // Handle API errors (including potential 401s that slip through)
  if ((progressError || goalsError) && !progressLoading) {
    const errorMessage = progressErrorData?.message || goalsErrorData?.message;
    if (errorMessage?.includes('401') || errorMessage?.includes('Unauthorized')) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <UnauthorizedState 
            title={t("dashboard.heroTitle")}
            description={t("auth.loginRequiredDescription")}
          />
        </div>
      );
    }
  }

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (location) {
      case "/practice":
        return (
          <section className="mb-12" data-testid="practice-section">
            <h3 className="text-3xl font-bold mb-8">{t("dashboard.interactivePractice")}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PromptEditor
                moduleId={activeModuleId}
                onAnalyze={handleAnalyzePrompt}
                isAnalyzing={assessMutation.isPending}
              />
              <FeedbackPanel
                feedback={currentFeedback}
                prompt={currentPrompt}
                onApplySuggestions={handleApplySuggestions}
                onNewExercise={handleNewExercise}
              />
            </div>
          </section>
        );
      
      case "/progress":
        return (
          <section className="mb-12" data-testid="progress-section">
            <h3 className="text-3xl font-bold mb-8">{t("dashboard.yourLearningJourney")}</h3>
            <ProgressTracker modules={MODULES} userProgress={userProgress} />
          </section>
        );
      
      default: // Dashboard (/)
        return (
          <>
            {/* Hero Section */}
            <section className="mb-12" data-testid="hero-section">
              <div className="gradient-bg rounded-xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-4">{t("dashboard.heroTitle")}</h2>
                  <p className="text-xl mb-6 opacity-90">
                    {t("dashboard.heroSubtitle")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold" data-testid="hero-courses">
                        {totalCourses}
                      </div>
                      <div className="text-sm opacity-80">{t("courses.allCourses")}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold" data-testid="hero-score">
                        {currentFeedback ? currentFeedback.overall_score : 0}
                      </div>
                      <div className="text-sm opacity-80">{t("dashboard.currentScore")}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold" data-testid="hero-progress">
                        {Math.round(overallProgress)}%
                      </div>
                      <div className="text-sm opacity-80">{t("common.progress")}</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link href="/courses">
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="explore-courses">
                        {t("dashboard.exploreMore")}
                        <i className="fas fa-arrow-right ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
              </div>
            </section>

            {/* Goals Section */}
            <section className="mb-12" data-testid="goals-section">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  {t("dashboard.myGoals")}
                </h3>
                <Link href="/goals">
                  <Button variant="outline" className="flex items-center gap-2" data-testid="view-all-goals">
                    <Plus className="w-4 h-4" />
                    {t("goals.manageGoals")}
                  </Button>
                </Link>
              </div>

              {activeGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      progress={calculateGoalProgress(goal)}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12" data-testid="no-goals">
                  <CardContent>
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-2xl mb-2">{t("goals.setYourGoals")}</CardTitle>
                    <CardDescription className="mb-6">
                      {t("goals.setGoalsDescription")}
                    </CardDescription>
                    <Link href="/goals">
                      <Button className="flex items-center gap-2" data-testid="create-first-goal">
                        <Plus className="w-4 h-4" />
                        {t("goals.createFirstGoal")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              {activeGoals.length > 3 && (
                <div className="text-center mt-6">
                  <Link href="/goals">
                    <Button variant="outline" data-testid="view-more-goals">
                      {t("goals.viewAllGoals")} ({activeGoals.length})
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* My Courses Section */}
            <section className="mb-12" data-testid="my-courses-section">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold">{t("dashboard.enrolledCourses")}</h3>
                <Link href="/courses">
                  <Button variant="outline" data-testid="view-all-courses">
                    {t("dashboard.allCourses")}
                    <i className="fas fa-external-link-alt ml-2" />
                  </Button>
                </Link>
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={calculateCourseProgress(course.id)}
                      moduleCount={getModuleCount(course.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12" data-testid="no-courses">
                  <CardContent>
                    <div className="w-64 mx-auto mb-6 text-muted-foreground">
                      <i className="fas fa-graduation-cap text-6xl mb-4 block" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Start Your Learning Journey</CardTitle>
                    <CardDescription className="mb-6">
                      Enroll in courses to begin mastering prompt engineering skills.
                    </CardDescription>
                    <Link href="/courses">
                      <Button data-testid="browse-courses">
                        Browse Available Courses
                        <i className="fas fa-arrow-right ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Recent Activity Section */}
            {enrolledCourses.length > 0 && (
              <section className="mb-12" data-testid="recent-activity">
                <h3 className="text-3xl font-bold mb-8">{t("dashboard.recentActivity")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <i className="fas fa-clock text-primary" />
                        {t("dashboard.continueLearning")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {enrolledCourses.map((course) => {
                        const progress = calculateCourseProgress(course.id);
                        const inProgressModules = MODULES.filter(module => 
                          module.courseId === course.id && 
                          userProgress.some(p => p.moduleId === module.id && !p.isCompleted)
                        );
                        
                        return inProgressModules.length > 0 ? (
                          <div key={course.id} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {course.titleKey ? t(course.titleKey) : course.title}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(progress.overallProgress)}% complete
                              </span>
                            </div>
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline" className="w-full">
                                Continue Course
                                <i className="fas fa-play ml-2" />
                              </Button>
                            </Link>
                          </div>
                        ) : null;
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <i className="fas fa-chart-line text-primary" />
                        Learning Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Enrolled Courses</span>
                          <span className="font-bold">{enrolledCourses.length}/{totalCourses}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Completed Modules</span>
                          <span className="font-bold">{completedModules}/{totalModules}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Overall Progress</span>
                          <span className="font-bold">{Math.round(overallProgress)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* All Courses Preview */}
            <section className="mb-12" data-testid="all-courses-preview">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold">{t("dashboard.allCourses")}</h3>
                <Link href="/courses">
                  <Button variant="ghost" data-testid="see-all-courses">
                    See All
                    <i className="fas fa-arrow-right ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COURSES.slice(0, 3).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={calculateCourseProgress(course.id)}
                    moduleCount={getModuleCount(course.id)}
                  />
                ))}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-primary">{t("nav.logo")}</h3>
              <p className="text-sm text-muted-foreground">{t("dashboard.masterArt")}</p>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">{t("footer.help")}</a>
              <a href="#" className="hover:text-foreground">{t("footer.documentation")}</a>
              <a href="#" className="hover:text-foreground">{t("footer.community")}</a>
              <a href="#" className="hover:text-foreground">{t("footer.contact")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}