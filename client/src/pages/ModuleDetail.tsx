import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, BookOpen, PenTool, CheckCircle, Circle, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TextWithAILinks } from "@/components/AIModelLink";
import { MODULES, MODULE_CONTENT } from "@/lib/constants";
import type { Module, UserProgress, AssessmentFeedback } from "@shared/schema";

interface ModuleDetailProps {
  moduleId: string;
}

export default function ModuleDetail({ moduleId }: ModuleDetailProps) {
  const [location, setLocation] = useLocation();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercisePrompts, setExercisePrompts] = useState<{ [key: number]: string }>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<{ [key: number]: AssessmentFeedback }>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get module data
  const moduleData = MODULES.find(m => m.id === moduleId);
  const moduleContent = MODULE_CONTENT[moduleId as keyof typeof MODULE_CONTENT];

  // Get all course modules for locking logic
  const courseModules = MODULES.filter(module => module.courseId === moduleData?.courseId);

  // Fetch user progress
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"]
  });

  // Check if current module is locked
  const isModuleLocked = (module: typeof moduleData) => {
    // All modules are unlocked - no restrictions
    return false;
  };

  const isCurrentModuleLocked = moduleData ? isModuleLocked(moduleData) : false;

  // Fetch exercise-specific data from backend
  const { data: completedExercisesArray = [] } = useQuery<number[]>({
    queryKey: [`/api/exercises/${moduleId}/completed`]
  });

  const { data: exerciseScores = {} } = useQuery<{ [key: string]: number }>({
    queryKey: [`/api/exercises/${moduleId}/scores`]
  });

  const currentProgress = userProgress.find(p => p.moduleId === moduleId);
  const completedExercises = new Set(completedExercisesArray);

  // Assessment mutation
  const assessMutation = useMutation({
    mutationFn: async ({ prompt, moduleId, exerciseIndex }: { prompt: string; moduleId: string; exerciseIndex: number }) => {
      const response = await apiRequest("POST", "/api/assess", { prompt, moduleId, exerciseIndex });
      return response.json();
    },
    onSuccess: (feedback: AssessmentFeedback, variables) => {
      setExerciseFeedback(prev => ({
        ...prev,
        [currentExerciseIndex]: feedback
      }));
      
      // Show success message if score is good
      if (feedback.overall_score >= 80) {
        toast({
          title: "Exercise Completed!",
          description: `Great work! You scored ${feedback.overall_score}/100`,
        });
      }

      // Invalidate all relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: [`/api/exercises/${moduleId}/completed`] });
      queryClient.invalidateQueries({ queryKey: [`/api/exercises/${moduleId}/scores`] });
    },
    onError: (error) => {
      console.error("Assessment error:", error);
      toast({
        title: "Assessment Failed",
        description: "There was an error analyzing your prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeExercise = () => {
    const prompt = exercisePrompts[currentExerciseIndex];
    if (!prompt?.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please write a prompt before analyzing.",
        variant: "destructive",
      });
      return;
    }
    
    assessMutation.mutate({ prompt, moduleId, exerciseIndex: currentExerciseIndex });
  };

  const handlePromptChange = (value: string) => {
    setExercisePrompts(prev => ({
      ...prev,
      [currentExerciseIndex]: value
    }));
  };

  const handleUseTemplate = () => {
    const currentExercise = moduleContent?.exercises[currentExerciseIndex];
    if (currentExercise?.template) {
      setExercisePrompts(prev => ({
        ...prev,
        [currentExerciseIndex]: currentExercise.template
      }));
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < (moduleContent?.exercises.length || 0) - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const currentPrompt = exercisePrompts[currentExerciseIndex] || "";
  const currentFeedback = exerciseFeedback[currentExerciseIndex];
  const currentExercise = moduleContent?.exercises[currentExerciseIndex];
  const completedCount = completedExercises.size;
  const totalExercises = moduleContent?.exercises.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  if (!moduleData || !moduleContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t("common.moduleNotFound")}</h2>
          <p className="text-muted-foreground mb-4">{t("common.moduleNotFoundDesc")}</p>
          <Link href="/modules">
            <Button>{t("common.backToModules")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if module is locked and show locked state
  if (isCurrentModuleLocked) {
    const requiredModule = courseModules.find(m => m.order === moduleData.order - 1);
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("common.moduleBlocked")}</h2>
                <p className="text-muted-foreground">{t("common.moduleBlockedDesc")}</p>
              </div>

              {requiredModule && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("common.unlockRequirement")}:
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>{requiredModule.title}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <TextWithAILinks text={requiredModule.description} />
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t("common.sequentialLearning")}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Link href={`/courses/${moduleData.courseId}`}>
                  <Button variant="outline">{t("common.backToCourses")}</Button>
                </Link>
                {requiredModule && (
                  <Link href={`/modules/${requiredModule.id}`}>
                    <Button>
                      {t("common.start")} {requiredModule.title}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="module-detail">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/modules">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Modules
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-3xl font-bold" data-testid="module-title">
                  {moduleData.title}
                </h1>
                <p className="text-muted-foreground" data-testid="module-description">
                  <TextWithAILinks text={moduleData.description} />
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold" data-testid="progress-count">
                {completedCount}/{totalExercises}
              </div>
              <Progress value={progressPercentage} className="w-24 h-2 mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="learn" className="space-y-6" data-testid="module-tabs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="learn" data-testid="tab-learn">
              <BookOpen className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="practice" data-testid="tab-practice">
              <PenTool className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
          </TabsList>

          {/* Learning Content Tab */}
          <TabsContent value="learn" className="space-y-6" data-testid="learn-content">
            <div className="grid gap-6">
              {moduleContent.sections.map((section, index) => (
                <Card key={index} data-testid={`section-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: section.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>').replace(/^\*\*(.*?)\*\*$/gm, '<strong>$1</strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }}
                    />
                    
                    {section.examples && section.examples.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-accent" />
                          Examples
                        </h4>
                        <div className="space-y-3">
                          {section.examples.map((example, exampleIndex) => (
                            <div 
                              key={exampleIndex}
                              className="bg-accent/10 border border-accent/20 rounded-lg p-4"
                              data-testid={`example-${index}-${exampleIndex}`}
                            >
                              <p className="text-sm text-muted-foreground italic">
                                {example}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6" data-testid="practice-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exercise Panel */}
              <Card data-testid="exercise-panel">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <PenTool className="h-5 w-5 mr-2" />
                      Exercise {currentExerciseIndex + 1} of {totalExercises}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {completedExercises.has(currentExerciseIndex) ? (
                        <CheckCircle className="h-5 w-5 text-secondary" data-testid="exercise-completed" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" data-testid="exercise-incomplete" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {currentExercise && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2" data-testid="exercise-title">
                          {currentExercise.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4" data-testid="exercise-description">
                          <TextWithAILinks text={currentExercise.description} />
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Your Prompt</label>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePromptChange("")}
                              data-testid="button-clear"
                            >
                              Clear
                            </Button>
                            {currentExercise.template && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleUseTemplate}
                                data-testid="button-template"
                              >
                                Use Template
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <Textarea
                          value={currentPrompt}
                          onChange={(e) => handlePromptChange(e.target.value)}
                          placeholder="Write your prompt here..."
                          className="min-h-[200px] font-mono text-sm resize-none"
                          data-testid="exercise-textarea"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <span data-testid="char-count">
                            Characters: {currentPrompt.length}
                          </span>
                          <span className="ml-4" data-testid="word-count">
                            Words: {currentPrompt.split(/\s+/).filter(w => w.length > 0).length}
                          </span>
                        </div>
                        
                        <Button
                          onClick={handleAnalyzeExercise}
                          disabled={!currentPrompt.trim() || assessMutation.isPending}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          data-testid="button-analyze"
                        >
                          {assessMutation.isPending ? "Analyzing..." : "Analyze Prompt"}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={handlePreviousExercise}
                          disabled={currentExerciseIndex === 0}
                          data-testid="button-previous"
                        >
                          Previous Exercise
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={handleNextExercise}
                          disabled={currentExerciseIndex >= totalExercises - 1}
                          data-testid="button-next"
                        >
                          Next Exercise
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Feedback Panel */}
              <Card data-testid="feedback-panel">
                <CardHeader>
                  <CardTitle>AI Assessment & Feedback</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {currentFeedback ? (
                    <div className="space-y-6">
                      {/* Overall Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Score</span>
                          <span className={`text-2xl font-bold ${
                            currentFeedback.overall_score >= 80 ? "text-secondary" :
                            currentFeedback.overall_score >= 60 ? "text-accent" : "text-destructive"
                          }`} data-testid="overall-score">
                            {currentFeedback.overall_score}/100
                          </span>
                        </div>
                        <Progress value={currentFeedback.overall_score} className="h-3" />
                      </div>

                      {/* Score Breakdown */}
                      <div className="space-y-3">
                        {[
                          { label: "Clarity & Structure", score: currentFeedback.clarity_structure, key: "clarity" },
                          { label: "Context Completeness", score: currentFeedback.context_completeness, key: "context" },
                          { label: "Specificity", score: currentFeedback.specificity, key: "specificity" },
                          { label: "Actionability", score: currentFeedback.actionability, key: "actionability" }
                        ].map(({ label, score, key }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm">{label}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    score >= 80 ? "bg-secondary" :
                                    score >= 60 ? "bg-accent" : "bg-destructive"
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8" data-testid={`score-${key}`}>
                                {score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Strengths */}
                      {currentFeedback.strengths.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-3 text-secondary flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Strengths
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {currentFeedback.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start" data-testid={`strength-${index}`}>
                                <span className="text-secondary mr-2">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas for Improvement */}
                      {currentFeedback.improvements.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-3 text-accent flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Areas for Improvement
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {currentFeedback.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start" data-testid={`improvement-${index}`}>
                                <span className="text-accent mr-2">•</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggestions */}
                      {currentFeedback.suggestions.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-3 text-primary flex items-center">
                            <PenTool className="h-4 w-4 mr-2" />
                            Suggestions
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {currentFeedback.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start" data-testid={`suggestion-${index}`}>
                                <span className="text-primary mr-2">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Complete an exercise to see your assessment and feedback.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Exercise Overview */}
            <Card data-testid="exercise-overview">
              <CardHeader>
                <CardTitle>Exercise Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduleContent.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        index === currentExerciseIndex
                          ? "border-primary bg-primary/10"
                          : completedExercises.has(index)
                          ? "border-secondary bg-secondary/10"
                          : "border-border hover:border-accent"
                      }`}
                      onClick={() => setCurrentExerciseIndex(index)}
                      data-testid={`exercise-overview-${index}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Exercise {index + 1}</h4>
                        {completedExercises.has(index) ? (
                          <CheckCircle className="h-4 w-4 text-secondary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{exercise.title}</p>
                      {exerciseFeedback[index] && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Score: {exerciseFeedback[index].overall_score}/100
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}