import { Link } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle
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

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export default function RecommendationCard({ recommendation, className = "" }: RecommendationCardProps) {
  const { t } = useTranslation();

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'next-in-sequence':
        return ArrowRight;
      case 'goal-aligned':
        return Target;
      case 'review-needed':
        return RefreshCw;
      case 'similar-interests':
        return BookOpen;
      case 'difficulty-progressive':
        return TrendingUp;
      case 'time-based':
        return Clock;
      default:
        return Star;
    }
  };

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case 'next-in-sequence':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'goal-aligned':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case 'review-needed':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case 'similar-interests':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'difficulty-progressive':
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case 'time-based':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "intermediate":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "advanced":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getPriorityLevel = (score: number) => {
    if (score >= 90) return { level: 'high', color: 'text-red-600 dark:text-red-400' };
    if (score >= 75) return { level: 'medium', color: 'text-amber-600 dark:text-amber-400' };
    return { level: 'low', color: 'text-green-600 dark:text-green-400' };
  };

  const getEngagementIcon = (engagement?: string) => {
    switch (engagement) {
      case 'high':
        return <Star className="h-4 w-4 text-yellow-500 fill-current" />;
      case 'medium':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <Star className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const TypeIcon = getRecommendationTypeIcon(recommendation.type);
  const priority = getPriorityLevel(recommendation.priorityScore);
  const targetUrl = recommendation.moduleId 
    ? `/modules/${recommendation.moduleId}`
    : recommendation.courseId
    ? `/courses/${recommendation.courseId}`
    : '#';

  return (
    <Card className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg border-l-4 ${recommendation.type === 'goal-aligned' ? 'border-l-purple-500' : recommendation.type === 'next-in-sequence' ? 'border-l-blue-500' : 'border-l-gray-300'} ${className}`} data-testid={`recommendation-card-${recommendation.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <Badge 
                className={getRecommendationTypeColor(recommendation.type)} 
                data-testid={`badge-type-${recommendation.id}`}
              >
                {t(`recommendations.types.${recommendation.type}`)}
              </Badge>
              {recommendation.difficulty && (
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(recommendation.difficulty)}
                  data-testid={`badge-difficulty-${recommendation.id}`}
                >
                  {t(`common.difficulty.${recommendation.difficulty}`)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${priority.color}`} data-testid={`priority-score-${recommendation.id}`}>
                {recommendation.priorityScore}%
              </span>
              {getEngagementIcon(recommendation.metadata.userEngagement)}
            </div>
            <span className="text-xs text-muted-foreground">
              {t(`recommendations.priority.${priority.level}`)}
            </span>
          </div>
        </div>
        
        <CardTitle className="text-lg leading-tight" data-testid={`title-${recommendation.id}`}>
          {recommendation.title}
        </CardTitle>
        <CardDescription className="text-sm" data-testid={`description-${recommendation.id}`}>
          {recommendation.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Reasoning */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`reasoning-${recommendation.id}`}>
              {recommendation.reasoning}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          {/* Progress indicators */}
          {recommendation.metadata.currentProgress !== undefined && recommendation.metadata.currentProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("recommendations.currentProgress")}</span>
                <span className="font-medium" data-testid={`current-progress-${recommendation.id}`}>
                  {Math.round(recommendation.metadata.currentProgress)}%
                </span>
              </div>
              <Progress value={recommendation.metadata.currentProgress} className="h-2" />
            </div>
          )}

          {/* Additional info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {recommendation.estimatedTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span data-testid={`estimated-time-${recommendation.id}`}>
                  {recommendation.estimatedTime}
                </span>
              </div>
            )}
            
            {recommendation.metadata.averageScore !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span data-testid={`average-score-${recommendation.id}`}>
                  {Math.round(recommendation.metadata.averageScore)}%
                </span>
              </div>
            )}

            {recommendation.metadata.goalAlignment && (
              <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm" data-testid={`goal-alignment-${recommendation.id}`}>
                  {recommendation.metadata.goalAlignment}
                </span>
              </div>
            )}

            {recommendation.metadata.prerequisitesMet !== undefined && (
              <div className="col-span-2 flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${recommendation.metadata.prerequisitesMet ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${recommendation.metadata.prerequisitesMet ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {t(recommendation.metadata.prerequisitesMet ? 'recommendations.prerequisitesMet' : 'recommendations.prerequisitesNotMet')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={targetUrl}>
            <Button 
              className="w-full" 
              variant={recommendation.priorityScore >= 85 ? "default" : "outline"}
              data-testid={`button-action-${recommendation.id}`}
            >
              <span>{t(`recommendations.actions.${recommendation.type}`)}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}