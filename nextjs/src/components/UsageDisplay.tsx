"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Zap, TestTube, DollarSign } from "lucide-react";
import type { UserSubscription, DailyUsage } from "@/db/schema";

interface UsageDisplayProps {
  subscription: UserSubscription;
  dailyUsage: DailyUsage | null;
  isLoading?: boolean;
  className?: string;
}

interface UsageCardProps {
  title: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "amber" | "red";
  unlimited?: boolean;
}

const colorClasses = {
  blue: {
    progress: "bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800"
  },
  green: {
    progress: "bg-green-600", 
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800"
  },
  amber: {
    progress: "bg-amber-600",
    text: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800"
  },
  red: {
    progress: "bg-red-600",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20", 
    border: "border-red-200 dark:border-red-800"
  }
};

function UsageCard({ title, current, limit, unit, icon: Icon, color, unlimited = false }: UsageCardProps) {
  const percentage = unlimited ? 0 : limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isOverLimit = !unlimited && current > limit;
  const isNearLimit = !unlimited && percentage >= 80;
  const colors = colorClasses[color];

  return (
    <Card className={`${colors.bg} ${colors.border}`} data-testid={`usage-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/50 dark:bg-gray-900/50`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" data-testid="usage-title">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold" data-testid="usage-current">
                  {current.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {unlimited ? "unlimited" : `/ ${limit.toLocaleString()}`} {unit}
                </span>
              </div>
            </div>
          </div>
          
          {isOverLimit && (
            <Badge variant="destructive" className="text-xs" data-testid="over-limit-badge">
              Over Limit
            </Badge>
          )}
          
          {!unlimited && isNearLimit && !isOverLimit && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300" data-testid="near-limit-badge">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Near Limit
            </Badge>
          )}
        </div>

        {!unlimited && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span data-testid="usage-percentage">{percentage.toFixed(1)}% used</span>
              <span data-testid="usage-remaining">{Math.max(0, limit - current)} remaining</span>
            </div>
            <Progress 
              value={percentage}
              className="h-2"
              data-testid="usage-progress"
            />
          </div>
        )}

        {unlimited && (
          <div className="text-xs text-muted-foreground" data-testid="unlimited-message">
            No daily limits with your current plan
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UsageDisplay({ 
  subscription, 
  dailyUsage, 
  isLoading = false,
  className = ""
}: UsageDisplayProps) {
  if (isLoading) {
    return (
      <Card className={className} data-testid="usage-display-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Daily Usage
          </CardTitle>
          <CardDescription>Loading usage statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const promptsUsed = dailyUsage?.promptsUsed || 0;
  const testsRun = dailyUsage?.testsRun || 0;
  const totalCost = parseFloat(String(dailyUsage?.totalCost || "0"));

  const promptLimit = subscription.dailyPromptLimit === -1 ? 0 : subscription.dailyPromptLimit;
  const isUnlimitedPrompts = subscription.dailyPromptLimit === -1;

  // Calculate test limits based on plan
  const testLimit = subscription.plan === "free" ? 3 : subscription.plan === "pro" ? 20 : 50;
  const isUnlimitedTests = subscription.plan === "gold";

  const today = new Date().toLocaleDateString();

  return (
    <div className={className} data-testid="usage-display">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="usage-header-title">
            <Activity className="w-5 h-5 text-primary" />
            Daily Usage Overview
          </CardTitle>
          <CardDescription data-testid="usage-header-description">
            Your usage for {today} • {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UsageCard
          title="Daily Prompts"
          current={promptsUsed}
          limit={promptLimit}
          unit="prompts"
          icon={Zap}
          color={isUnlimitedPrompts ? "green" : promptsUsed >= promptLimit ? "red" : promptsUsed >= promptLimit * 0.8 ? "amber" : "blue"}
          unlimited={isUnlimitedPrompts}
        />

        <UsageCard
          title="Playground Tests"
          current={testsRun}
          limit={testLimit}
          unit="tests"
          icon={TestTube}
          color={isUnlimitedTests ? "green" : testsRun >= testLimit ? "red" : testsRun >= testLimit * 0.8 ? "amber" : "blue"}
          unlimited={isUnlimitedTests}
        />

        <UsageCard
          title="API Costs"
          current={totalCost}
          limit={subscription.plan === "free" ? 1 : subscription.plan === "pro" ? 10 : 25}
          unit="USD"
          icon={DollarSign}
          color={totalCost >= (subscription.plan === "free" ? 1 : subscription.plan === "pro" ? 10 : 25) ? "red" : 
                 totalCost >= (subscription.plan === "free" ? 0.8 : subscription.plan === "pro" ? 8 : 20) ? "amber" : "green"}
          unlimited={false}
        />
      </div>

      {/* Usage Tips */}
      <Card className="mt-6 bg-muted/30" data-testid="usage-tips">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Usage Tips
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {subscription.plan === "free" && (
              <>
                <p>• Upgrade to Pro for unlimited daily prompts and course access</p>
                <p>• Each AI assessment counts towards your daily prompt limit</p>
              </>
            )}
            {subscription.plan === "pro" && (
              <>
                <p>• You have unlimited prompts with your Pro plan</p>
                <p>• Consider Gold plan for unlimited playground tests and all courses</p>
              </>
            )}
            {subscription.plan === "gold" && (
              <>
                <p>• You have unlimited access to all features with your Gold plan</p>
                <p>• API costs are tracked for transparency but won&apos;t affect your access</p>
              </>
            )}
            <p>• Usage resets daily at midnight UTC</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
