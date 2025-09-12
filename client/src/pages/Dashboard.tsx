import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import ModuleCard from "@/components/ModuleCard";
import PromptEditor from "@/components/PromptEditor";
import FeedbackPanel from "@/components/FeedbackPanel";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { SAMPLE_EXERCISES } from "@/lib/constants";
import type { Module, UserProgress, AssessmentFeedback } from "@shared/schema";

export default function Dashboard() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState<AssessmentFeedback | undefined>();
  const [activeModuleId, setActiveModuleId] = useState<string>("basic-prompting");
  
  const queryClient = useQueryClient();

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"]
  });

  // Fetch user progress
  const { data: userProgress = [], isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"]
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

  const handleModuleStart = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setCurrentPrompt("");
    setCurrentFeedback(undefined);
  };

  const getModuleProgress = (moduleId: string) => {
    return userProgress.find(p => p.moduleId === moduleId);
  };

  const isModuleLocked = (module: Module) => {
    if (module.order === 1) return false;
    const previousModule = modules.find(m => m.order === module.order - 1);
    if (!previousModule) return false;
    const previousProgress = getModuleProgress(previousModule.id);
    return !previousProgress?.isCompleted;
  };

  const completedModules = userProgress.filter(p => p.isCompleted).length;
  const totalModules = modules.length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  if (modulesLoading || progressLoading) {
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
    <div className="min-h-screen bg-background" data-testid="dashboard">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <section className="mb-12" data-testid="hero-section">
          <div className="gradient-bg rounded-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Master the Art of Prompt Engineering</h2>
              <p className="text-xl mb-6 opacity-90">
                Learn to communicate effectively with AI through structured, progressive modules and hands-on practice.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold" data-testid="hero-modules">
                    {totalModules}
                  </div>
                  <div className="text-sm opacity-80">Learning Modules</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold" data-testid="hero-score">
                    {currentFeedback ? currentFeedback.overall_score : 0}
                  </div>
                  <div className="text-sm opacity-80">Current Score</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold" data-testid="hero-completed">
                    {completedModules}/{totalModules}
                  </div>
                  <div className="text-sm opacity-80">Completed</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
          </div>
        </section>

        {/* Learning Modules */}
        <section className="mb-12" data-testid="modules-section">
          <h3 className="text-3xl font-bold mb-8">Learning Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                progress={getModuleProgress(module.id)}
                isLocked={isModuleLocked(module)}
                onStart={() => handleModuleStart(module.id)}
              />
            ))}
          </div>
        </section>

        {/* Interactive Practice Section */}
        <section className="mb-12" data-testid="practice-section">
          <h3 className="text-3xl font-bold mb-8">Interactive Practice</h3>
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

        {/* Progress Tracking */}
        <section className="mb-12" data-testid="progress-section">
          <h3 className="text-3xl font-bold mb-8">Your Learning Journey</h3>
          <ProgressTracker modules={modules} userProgress={userProgress} />
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-primary">PromptMaster</h3>
              <p className="text-sm text-muted-foreground">Master the art of AI communication</p>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Help</a>
              <a href="#" className="hover:text-foreground">Documentation</a>
              <a href="#" className="hover:text-foreground">Community</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
