import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import Navigation from "@/components/Navigation";
import UnauthorizedState from "@/components/UnauthorizedState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Play, 
  Save, 
  Copy, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Hash,
  Settings,
  Brain,
  Plus,
  Trash2,
  Edit3,
  Star,
  Download,
  BarChart3,
  Trophy,
  Zap,
  Target
} from "lucide-react";
import type { 
  PlaygroundTestResult, 
  PlaygroundPrompt, 
  PlaygroundUsage,
  PlaygroundParameters,
  PlaygroundComparisonMetrics,
  RunPlaygroundTestRequest,
  SavePlaygroundPromptRequest,
  RatePlaygroundResultRequest
} from "@shared/schema";

export default function PlaygroundPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [promptText, setPromptText] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [parameters, setParameters] = useState<PlaygroundParameters>({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0
  });
  const [testResults, setTestResults] = useState<PlaygroundTestResult[]>([]);
  const [totalCost, setTotalCost] = useState<string>("0.00");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<PlaygroundComparisonMetrics | null>(null);

  // Available models query with error handling
  const { 
    data: availableModels = [], 
    isLoading: modelsLoading, 
    isError: modelsError, 
    error: modelsErrorData 
  } = useQuery<string[]>({
    queryKey: ["/api/playground/models"],
    enabled: isAuthenticated,
    retry: 2
  });

  // Saved prompts query with error handling
  const { 
    data: savedPrompts = [], 
    isLoading: promptsLoading, 
    isError: promptsError, 
    error: promptsErrorData 
  } = useQuery<PlaygroundPrompt[]>({
    queryKey: ["/api/playground/prompts"],
    enabled: isAuthenticated,
    retry: 1
  });

  // Usage analytics query with error handling
  const { 
    data: usage, 
    isError: usageError, 
    error: usageErrorData 
  } = useQuery<PlaygroundUsage>({
    queryKey: ["/api/playground/usage"],
    enabled: isAuthenticated,
    retry: 1
  });

  // Error logging effects to replace deprecated onError callbacks
  useEffect(() => {
    if (modelsError && modelsErrorData) {
      console.error("Failed to load available models:", modelsErrorData);
    }
  }, [modelsError, modelsErrorData]);

  useEffect(() => {
    if (promptsError && promptsErrorData) {
      console.error("Failed to load saved prompts:", promptsErrorData);
    }
  }, [promptsError, promptsErrorData]);

  useEffect(() => {
    if (usageError && usageErrorData) {
      console.error("Failed to load usage analytics:", usageErrorData);
    }
  }, [usageError, usageErrorData]);

  // Synchronize selectedModels with availableModels
  useEffect(() => {
    if (availableModels.length > 0) {
      // Intersect current selection with available models
      const validSelected = selectedModels.filter((model: string) => availableModels.includes(model));
      
      // If no valid models selected, default to first 1-2 available models
      if (validSelected.length === 0) {
        const defaultModels = availableModels.slice(0, Math.min(2, availableModels.length));
        setSelectedModels(defaultModels);
      } else if (validSelected.length !== selectedModels.length) {
        // Update to only valid models
        setSelectedModels(validSelected);
      }
    }
  }, [availableModels]);

  // Set page metadata
  useEffect(() => {
    document.title = t("pageMetadata.playground.title");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t("pageMetadata.playground.description"));
    }
  }, [t]);

  // Run test mutation
  const runTestMutation = useMutation({
    mutationFn: async (request: RunPlaygroundTestRequest) => {
      const response = await apiRequest("POST", "/api/playground/tests/run", request);
      return response.json();
    },
    onSuccess: (data) => {
      setTestResults(data.results || []);
      setTotalCost(data.totalCost || "0.00");
      setCurrentTestId(data.testId || null);
      setIsRunning(false);
      // Calculate comparison metrics from the new results
      calculateAndSetMetrics(data.results || []);
      queryClient.invalidateQueries({ queryKey: ["/api/playground/usage"] });
      toast({
        title: t("playground.testCompleted"),
        description: t("playground.testCompletedDesc", { 
          count: data.results?.length || 0, 
          cost: data.totalCost || "0.00" 
        }),
      });
    },
    onError: (error: Error) => {
      setIsRunning(false);
      const errorMessage = error.message || t("playground.testFailedGeneric");
      toast({
        title: t("playground.testFailed"),
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Save prompt mutation
  const savePromptMutation = useMutation({
    mutationFn: async (request: SavePlaygroundPromptRequest) => {
      const response = await apiRequest("POST", "/api/playground/prompts", request);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playground/prompts"] });
      setPromptTitle("");
      toast({
        title: t("playground.promptSaved"),
        description: t("playground.promptSavedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("playground.failedToSavePrompt"),
        description: error.message || t("playground.errorWhileSaving"),
        variant: "destructive",
      });
    },
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: async (promptId: string) => {
      await apiRequest("DELETE", `/api/playground/prompts/${promptId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playground/prompts"] });
      toast({
        title: t("playground.promptDeleted"),
        description: t("playground.promptDeletedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("playground.failedToDeletePrompt"),
        description: error.message || t("playground.errorWhileDeleting"),
        variant: "destructive",
      });
    },
  });

  // Rate model response mutation
  const rateResponseMutation = useMutation({
    mutationFn: async ({ testId, modelName, rating }: RatePlaygroundResultRequest) => {
      const response = await apiRequest("POST", `/api/playground/tests/${testId}/rate`, {
        modelName,
        rating
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Calculate updated results with new rating
      const updatedResults = testResults.map(result => 
        result.modelName === variables.modelName 
          ? { ...result, rating: variables.rating, ratedAt: new Date().toISOString() }
          : result
      );
      
      // Update local state with new rating
      setTestResults(updatedResults);
      
      // Recalculate comparison metrics with updated results
      calculateAndSetMetrics(updatedResults);
      
      toast({
        title: t("playground.ratingAdded"),
        description: t("playground.ratingAddedDesc", { rating: variables.rating }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("playground.failedToRate"),
        description: error.message || t("playground.errorWhileRating"),
        variant: "destructive",
      });
    },
  });

  const handleModelToggle = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter((m: string) => m !== model)
        : [...prev, model]
    );
  };

  const handleRunTest = () => {
    if (!promptText.trim()) {
      toast({
        title: t("playground.emptyPromptTitle"),
        description: t("playground.emptyPromptDesc"),
        variant: "destructive",
      });
      return;
    }

    if (selectedModels.length === 0) {
      toast({
        title: t("playground.noModelsSelected"),
        description: t("playground.noModelsSelectedDesc"),
        variant: "destructive",
      });
      return;
    }

    // Additional validation: ensure selected models are available
    const validModels = selectedModels.filter((model: string) => availableModels.includes(model));
    if (validModels.length === 0) {
      toast({
        title: t("playground.noModelsSelected"),
        description: t("playground.noModelsSelectedDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    setTotalCost("0.00");
    
    runTestMutation.mutate({
      promptText,
      models: validModels, // Use only valid models
      parameters,
    });
  };

  const handleSavePrompt = () => {
    if (!promptTitle.trim()) {
      toast({
        title: t("playground.missingTitle"),
        description: t("playground.missingTitleDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!promptText.trim()) {
      toast({
        title: t("playground.emptyPromptContent"),
        description: t("playground.emptyPromptContentDesc"),
        variant: "destructive",
      });
      return;
    }

    savePromptMutation.mutate({
      title: promptTitle,
      content: promptText,
      isPublic: false,
    });
  };

  const handleLoadPrompt = (prompt: PlaygroundPrompt) => {
    setPromptText(prompt.content);
    setPromptTitle(prompt.title);
  };

  const handleCopyResponse = async (response: string) => {
    try {
      await navigator.clipboard.writeText(response);
      toast({
        title: t("playground.copiedToClipboard"),
        description: t("playground.responseCopied"),
      });
    } catch (error) {
      toast({
        title: t("playground.failedToCopy"),
        description: t("playground.couldNotCopy"),
        variant: "destructive",
      });
    }
  };

  const getModelDisplayName = (modelName: string) => {
    const displayNames: Record<string, string> = {
      "gpt-4o": "GPT-4o",
      "claude-3.5-sonnet": "Claude 3.5 Sonnet",
      "gemini-1.5-pro": "Gemini 1.5 Pro",
      "gpt-4o-mini": "GPT-4o Mini"
    };
    return displayNames[modelName] || modelName;
  };

  const getTokenCount = (text: string) => {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  };

  // Calculate comparison metrics from current test results
  const calculateAndSetMetrics = (results: PlaygroundTestResult[]) => {
    const validResults = results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      setComparisonMetrics(null);
      return;
    }

    // Find winners by different metrics
    const fastestModel = validResults.reduce((prev, curr) => 
      prev.responseTime < curr.responseTime ? prev : curr
    );
    
    const cheapestModel = validResults.reduce((prev, curr) => 
      parseFloat(prev.cost) < parseFloat(curr.cost) ? prev : curr
    );

    const ratedResults = validResults.filter(r => r.rating);
    const highestRatedModel = ratedResults.length > 0 
      ? ratedResults.reduce((prev, curr) => (prev.rating || 0) > (curr.rating || 0) ? prev : curr)
      : validResults[0];

    // Calculate efficiency (rating per dollar spent)
    const efficiencyResults = validResults
      .filter(r => r.rating && parseFloat(r.cost) > 0)
      .map(r => ({ 
        ...r, 
        efficiency: (r.rating || 0) / parseFloat(r.cost) 
      }));
    
    const mostEfficientModel = efficiencyResults.length > 0
      ? efficiencyResults.reduce((prev, curr) => prev.efficiency > curr.efficiency ? prev : curr)
      : cheapestModel;

    // Calculate averages and stats
    const avgResponseTime = validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length;
    const totalCostNum = validResults.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    
    const ratings = validResults.filter(r => r.rating).map(r => r.rating!);
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : undefined;

    // Response length statistics
    const responseLengths = validResults.map(r => r.response.length);
    const minLength = Math.min(...responseLengths);
    const maxLength = Math.max(...responseLengths);
    const avgLength = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length;

    setComparisonMetrics({
      winner: {
        speed: fastestModel.modelName,
        cost: cheapestModel.modelName,
        quality: highestRatedModel.modelName,
        efficiency: mostEfficientModel.modelName
      },
      averageResponseTime: Math.round(avgResponseTime),
      totalCost: totalCostNum.toFixed(2),
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : undefined,
      responseStats: {
        minLength,
        maxLength,
        avgLength: Math.round(avgLength)
      }
    });
  };

  // Handle rating a model response
  const handleRateResponse = (modelName: string, rating: number) => {
    if (!currentTestId) {
      toast({
        title: t("playground.noTestToRate"),
        description: t("playground.noTestToRateDesc"),
        variant: "destructive",
      });
      return;
    }

    rateResponseMutation.mutate({
      testId: currentTestId,
      modelName,
      rating
    });
  };

  // Handle export functionality
  const handleExport = async (format: "json" | "csv" | "txt" | "clipboard") => {
    if (!currentTestId) {
      toast({
        title: t("playground.noTestToExport"),
        description: t("playground.noTestToExportDesc"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (format === "clipboard") {
        const response = await apiRequest("GET", `/api/playground/tests/${currentTestId}/clipboard`);
        const data = await response.json();
        
        await navigator.clipboard.writeText(data.content);
        toast({
          title: t("playground.copiedToClipboard"),
          description: t("playground.exportCopiedToClipboard"),
        });
      } else {
        const response = await apiRequest("POST", `/api/playground/tests/${currentTestId}/export`, {
          format,
          includeRatings: true,
          includeMetadata: true
        });

        // For file downloads, trigger the download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `playground-test-${currentTestId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: t("playground.exportSuccessful"),
          description: t("playground.exportSuccessfulDesc", { format: format.toUpperCase() }),
        });
      }
    } catch (error) {
      toast({
        title: t("playground.exportFailed"),
        description: error instanceof Error ? error.message : t("playground.exportFailedGeneric"),
        variant: "destructive",
      });
    }
  };

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
          title={t("playground.title")}
          description={t("auth.loginRequiredDescription")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8" data-testid="playground-header">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4" data-testid="playground-title">
            {t("playground.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="playground-description">
            {t("playground.description")}
          </p>
        </div>

        {/* Usage Analytics */}
        {usageError ? (
          <div className="mb-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("playground.usageLoadError")}
              </AlertDescription>
            </Alert>
          </div>
        ) : usage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600" data-testid="monthly-tests">
                  {usage.monthlyTests || 0}
                </div>
                <div className="text-sm text-muted-foreground">{t("playground.testsThisMonth")}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600" data-testid="total-cost">
                  ${usage.totalCost || "0.00"}
                </div>
                <div className="text-sm text-muted-foreground">{t("playground.totalSpent")}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600" data-testid="tests-run">
                  {usage.testsRun || 0}
                </div>
                <div className="text-sm text-muted-foreground">{t("playground.totalTests")}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Prompt Editor & Controls */}
          <div className="space-y-6">
            {/* Saved Prompts */}
            <Card data-testid="saved-prompts-section">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  {t("playground.savedPrompts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promptsLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{t("playground.loadingPrompts")}</p>
                  </div>
                ) : promptsError ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("playground.promptsLoadError")}
                    </AlertDescription>
                  </Alert>
                ) : savedPrompts.length > 0 ? (
                  <Select onValueChange={(value: string) => {
                    const prompt = savedPrompts.find((p: PlaygroundPrompt) => String(p.id) === String(value));
                    if (prompt) handleLoadPrompt(prompt);
                  }}>
                    <SelectTrigger data-testid="saved-prompts-select">
                      <SelectValue placeholder={t("playground.loadSavedPrompt")} />
                    </SelectTrigger>
                    <SelectContent>
                      {savedPrompts.map((prompt: PlaygroundPrompt) => (
                        <SelectItem key={String(prompt.id)} value={String(prompt.id)}>
                          {prompt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("playground.noSavedPrompts")}
                  </p>
                )}

                {savedPrompts.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {savedPrompts.slice(0, 3).map((prompt: PlaygroundPrompt) => (
                      <div key={String(prompt.id)} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate flex-1">{prompt.title}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadPrompt(prompt)}
                            data-testid={`load-prompt-${prompt.id}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePromptMutation.mutate(String(prompt.id))}
                            data-testid={`delete-prompt-${prompt.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prompt Editor */}
            <Card data-testid="prompt-editor-section">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  {t("playground.promptEditor")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-text">{t("moduleDetail.yourPrompt")}</Label>
                  <Textarea
                    id="prompt-text"
                    placeholder={t("playground.promptPlaceholder")}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="min-h-[200px] resize-none"
                    data-testid="prompt-textarea"
                  />
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{t("playground.charactersCount")}: {promptText.length}</span>
                    <span>{t("playground.estimatedTokens")}: {getTokenCount(promptText)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder={t("playground.promptTitle")}
                    value={promptTitle}
                    onChange={(e) => setPromptTitle(e.target.value)}
                    className="flex-1"
                    data-testid="prompt-title-input"
                  />
                  <Button
                    onClick={handleSavePrompt}
                    disabled={savePromptMutation.isPending}
                    variant="outline"
                    data-testid="save-prompt-button"
                  >
                    {savePromptMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Model Selection */}
            <Card data-testid="model-selection-section">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  {t("playground.modelSelection")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {modelsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">{t("playground.loadingModels")}</p>
                    </div>
                  ) : modelsError ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {modelsErrorData?.message?.includes("OPENROUTER_API_KEY") || modelsErrorData?.message?.includes("401") || modelsErrorData?.message?.includes("403")
                          ? t("playground.configureApiKey")
                          : t("playground.modelsLoadError")}
                      </AlertDescription>
                    </Alert>
                  ) : availableModels.length > 0 ? (
                    availableModels.map((model: string) => (
                      <div key={model} className="flex items-center space-x-2">
                        <Checkbox
                          id={model}
                          checked={selectedModels.includes(model)}
                          onCheckedChange={() => handleModelToggle(model)}
                          data-testid={`model-checkbox-${model}`}
                        />
                        <Label htmlFor={model} className="flex-1 cursor-pointer">
                          {getModelDisplayName(model)}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("playground.noModelsAvailable")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card data-testid="parameters-section">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t("playground.parameters")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("playground.temperatureLabel")}: {parameters.temperature}</Label>
                  <Slider
                    value={[parameters.temperature]}
                    onValueChange={(values) => setParameters(prev => ({ ...prev, temperature: values[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    data-testid="temperature-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("playground.temperatureHelp")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("playground.maxTokensLabel")}: {parameters.maxTokens}</Label>
                  <Slider
                    value={[parameters.maxTokens]}
                    onValueChange={(values) => setParameters(prev => ({ ...prev, maxTokens: values[0] }))}
                    max={4000}
                    min={1}
                    step={100}
                    data-testid="max-tokens-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("playground.maxTokensHelp")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("playground.topPLabel")}: {parameters.topP}</Label>
                  <Slider
                    value={[parameters.topP]}
                    onValueChange={(values) => setParameters(prev => ({ ...prev, topP: values[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    data-testid="top-p-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("playground.topPHelp")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Run Test Button */}
            <Button
              onClick={handleRunTest}
              disabled={isRunning || !promptText.trim() || selectedModels.length === 0 || availableModels.length === 0}
              className="w-full"
              size="lg"
              data-testid="run-test-button"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t("playground.runningTest")}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {t("playground.runTest")}
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            <Card data-testid="results-section">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {t("playground.testResults")}
                  </span>
                  {totalCost !== "0.00" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${totalCost}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isRunning ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("playground.testingModels")}</p>
                  </div>
                ) : testResults.length > 0 ? (
                  <div className="space-y-6">
                    {/* Comparison Summary Panel */}
                    {comparisonMetrics && (
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            {t("playground.comparisonSummary")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium">{t("playground.fastest")}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">{getModelDisplayName(comparisonMetrics.winner.speed)}</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">{t("playground.cheapest")}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">{getModelDisplayName(comparisonMetrics.winner.cost)}</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <Star className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">{t("playground.topRated")}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">{getModelDisplayName(comparisonMetrics.winner.quality)}</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">{t("playground.mostEfficient")}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">{getModelDisplayName(comparisonMetrics.winner.efficiency)}</div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                            <div>
                              <div className="text-muted-foreground">{t("playground.avgResponseTime")}</div>
                              <div className="font-medium">{comparisonMetrics.averageResponseTime}ms</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("playground.totalCost")}</div>
                              <div className="font-medium">${comparisonMetrics.totalCost}</div>
                            </div>
                            {comparisonMetrics.averageRating && (
                              <div>
                                <div className="text-muted-foreground">{t("playground.avgRating")}</div>
                                <div className="font-medium flex items-center justify-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {comparisonMetrics.averageRating}/5
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="text-muted-foreground">{t("playground.avgLength")}</div>
                              <div className="font-medium">{comparisonMetrics.responseStats.avgLength} chars</div>
                            </div>
                          </div>

                          {/* Export Buttons */}
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t("playground.exportResults")}:</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleExport("clipboard")} data-testid="export-clipboard">
                                <Copy className="w-3 h-3 mr-1" />
                                {t("playground.clipboard")}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleExport("json")} data-testid="export-json">
                                <Download className="w-3 h-3 mr-1" />
                                JSON
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleExport("csv")} data-testid="export-csv">
                                <Download className="w-3 h-3 mr-1" />
                                CSV
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleExport("txt")} data-testid="export-txt">
                                <Download className="w-3 h-3 mr-1" />
                                TXT
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Individual Result Cards */}
                    <div className="space-y-4">
                      {testResults.map((result: PlaygroundTestResult) => (
                        <Card key={result.modelName} className={result.error ? "border-destructive" : "border-border"}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {getModelDisplayName(result.modelName)}
                                {/* Winner badges */}
                                {comparisonMetrics && (
                                  <div className="flex gap-1">
                                    {comparisonMetrics.winner.speed === result.modelName && (
                                      <Badge variant="secondary" className="text-xs"><Zap className="w-3 h-3 mr-1" />Fastest</Badge>
                                    )}
                                    {comparisonMetrics.winner.cost === result.modelName && (
                                      <Badge variant="secondary" className="text-xs"><DollarSign className="w-3 h-3 mr-1" />Cheapest</Badge>
                                    )}
                                    {comparisonMetrics.winner.quality === result.modelName && (
                                      <Badge variant="secondary" className="text-xs"><Star className="w-3 h-3 mr-1" />Top Rated</Badge>
                                    )}
                                    {comparisonMetrics.winner.efficiency === result.modelName && (
                                      <Badge variant="secondary" className="text-xs"><Target className="w-3 h-3 mr-1" />Most Efficient</Badge>
                                    )}
                                  </div>
                                )}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {result.error ? (
                                  <AlertCircle className="w-4 h-4 text-destructive" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyResponse(result.response)}
                                  disabled={!result.response}
                                  data-testid={`copy-response-${result.modelName}`}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {result.tokenCount} {t("playground.tokens")}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${result.cost}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {result.responseTime}ms
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {result.response.length} chars
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            {result.error ? (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  {result.error}
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <>
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{result.response}</p>
                                </div>

                                {/* Rating Component */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{t("playground.rateResponse")}:</span>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          onClick={() => handleRateResponse(result.modelName, star)}
                                          disabled={rateResponseMutation.isPending}
                                          className="transition-colors hover:scale-110"
                                          data-testid={`rate-${result.modelName}-${star}`}
                                        >
                                          <Star 
                                            className={`w-4 h-4 ${
                                              (result.rating || 0) >= star 
                                                ? "fill-yellow-400 text-yellow-400" 
                                                : "text-gray-300 hover:text-yellow-400"
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                    {result.rating && (
                                      <span className="text-sm text-muted-foreground">
                                        ({result.rating}/5)
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground">
                                    Cost per token: ${(parseFloat(result.cost) / Math.max(result.tokenCount, 1)).toFixed(6)}
                                  </div>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t("playground.noTestResults")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}