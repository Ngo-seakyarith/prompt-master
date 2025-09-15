import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import RecommendationCard from "./RecommendationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  RefreshCw, 
  BookOpen, 
  Award, 
  Clock,
  ArrowRight,
  Star,
  Brain,
  Filter,
  RotateCcw,
  Lightbulb
} from "lucide-react";

interface Recommendation {
  id: string;
  type: 'next-in-sequence' | 'goal-aligned' | 'review-needed' | 'similar-interests' | 'difficulty-progressive' | 'time-based';
  moduleId?: string;
  courseId?: string;
  title: string;
  description: string;
  reasoning: string;
  priorityScore: number;
  estimatedTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  metadata: {
    currentProgress?: number;
    averageScore?: number;
    timeToComplete?: string;
    goalAlignment?: string;
    prerequisitesMet?: boolean;
    userEngagement?: 'high' | 'medium' | 'low';
  };
}

interface UserProfile {
  totalModulesCompleted: number;
  averageScore: number;
  preferredDifficulty: string;
  learningVelocity: number;
  strongAreas: string[];
  improvementAreas: string[];
  goalAlignment: number;
}

interface RecommendationAnalysis {
  recommendations: Recommendation[];
  userProfile: UserProfile;
}

interface RecommendationsSectionProps {
  className?: string;
  maxRecommendations?: number;
}

export default function RecommendationsSection({ className = "", maxRecommendations = 8 }: RecommendationsSectionProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  
  // Fetch recommendations
  const { 
    data: recommendationData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<RecommendationAnalysis>({
    queryKey: ["/api/recommendations"],
    enabled: isAuthenticated,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!isAuthenticated) {
    return null;
  }

  const recommendations = recommendationData?.recommendations || [];
  const userProfile = recommendationData?.userProfile;

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesType = selectedFilter === "all" || rec.type === selectedFilter;
    const matchesPriority = selectedPriority === "all" || 
      (selectedPriority === "high" && rec.priorityScore >= 85) ||
      (selectedPriority === "medium" && rec.priorityScore >= 70 && rec.priorityScore < 85) ||
      (selectedPriority === "low" && rec.priorityScore < 70);
    
    return matchesType && matchesPriority;
  }).slice(0, maxRecommendations);

  // Group recommendations by type for tabs
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = [];
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'next-in-sequence': return ArrowRight;
      case 'goal-aligned': return Target;
      case 'review-needed': return RefreshCw;
      case 'similar-interests': return BookOpen;
      case 'difficulty-progressive': return TrendingUp;
      case 'time-based': return Clock;
      default: return Star;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`} data-testid="recommendations-loading">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-80">
              <CardHeader>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className={`${className}`} data-testid="recommendations-error">
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900">
              <RefreshCw className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t("recommendations.loadError")}</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t("recommendations.loadErrorDesc")}
              </p>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                  {error instanceof Error ? error.message : t("common.unknownError")}
                </p>
              )}
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              data-testid="button-retry-recommendations"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("common.tryAgain")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className={`${className}`} data-testid="recommendations-empty">
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
              <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t("recommendations.noRecommendations")}</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t("recommendations.noRecommendationsDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="recommendations-section">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold" data-testid="recommendations-title">
              {t("recommendations.title")}
            </h2>
          </div>
          <Badge variant="secondary" data-testid="recommendations-count">
            {recommendations.length} {t("recommendations.suggestions")}
          </Badge>
        </div>
        <p className="text-muted-foreground" data-testid="recommendations-subtitle">
          {t("recommendations.subtitle")}
        </p>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600" data-testid="profile-modules-completed">
                  {userProfile.totalModulesCompleted}
                </div>
                <div className="text-sm text-muted-foreground">{t("recommendations.modulesCompleted")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="profile-average-score">
                  {Math.round(userProfile.averageScore)}%
                </div>
                <div className="text-sm text-muted-foreground">{t("recommendations.averageScore")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600" data-testid="profile-learning-velocity">
                  {userProfile.learningVelocity.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">{t("recommendations.learningVelocity")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600" data-testid="profile-goal-alignment">
                  {Math.round(userProfile.goalAlignment)}%
                </div>
                <div className="text-sm text-muted-foreground">{t("recommendations.goalAlignment")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("common.filterBy")}:</span>
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-48" data-testid="filter-type">
            <SelectValue placeholder={t("recommendations.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("recommendations.allTypes")}</SelectItem>
            <SelectItem value="goal-aligned">{t("recommendations.types.goal-aligned")}</SelectItem>
            <SelectItem value="next-in-sequence">{t("recommendations.types.next-in-sequence")}</SelectItem>
            <SelectItem value="review-needed">{t("recommendations.types.review-needed")}</SelectItem>
            <SelectItem value="difficulty-progressive">{t("recommendations.types.difficulty-progressive")}</SelectItem>
            <SelectItem value="similar-interests">{t("recommendations.types.similar-interests")}</SelectItem>
            <SelectItem value="time-based">{t("recommendations.types.time-based")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-40" data-testid="filter-priority">
            <SelectValue placeholder={t("recommendations.filterByPriority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("recommendations.allPriorities")}</SelectItem>
            <SelectItem value="high">{t("recommendations.priority.high")}</SelectItem>
            <SelectItem value="medium">{t("recommendations.priority.medium")}</SelectItem>
            <SelectItem value="low">{t("recommendations.priority.low")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recommendations Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="all" data-testid="tab-all">
            {t("recommendations.allTypes")} ({recommendations.length})
          </TabsTrigger>
          {Object.entries(groupedRecommendations).map(([type, recs]) => {
            const TypeIcon = getTypeIcon(type);
            return (
              <TabsTrigger key={type} value={type} className="flex items-center gap-1" data-testid={`tab-${type}`}>
                <TypeIcon className="h-3 w-3" />
                <span className="hidden md:inline">{t(`recommendations.types.${type}`)}</span>
                ({recs.length})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="recommendations-grid">
            {filteredRecommendations.map((recommendation) => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation} 
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(groupedRecommendations).map(([type, typeRecommendations]) => (
          <TabsContent key={type} value={type} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid={`recommendations-grid-${type}`}>
              {typeRecommendations.map((recommendation) => (
                <RecommendationCard 
                  key={recommendation.id} 
                  recommendation={recommendation} 
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Show More Button */}
      {recommendations.length > maxRecommendations && filteredRecommendations.length === maxRecommendations && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setSelectedFilter("all")}
            data-testid="button-show-all-recommendations"
          >
            {t("recommendations.showAll")} ({recommendations.length - maxRecommendations} {t("common.more")})
          </Button>
        </div>
      )}
    </div>
  );
}