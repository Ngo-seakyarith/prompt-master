"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import type { UserSubscription } from "@/db/schema";

interface SubscriptionCardProps {
  planType: "free" | "pro" | "gold";
  title: string;
  price: string;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  currentSubscription?: UserSubscription;
  onUpgrade: (planType: string) => void;
  onManage?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const planIcons = {
  free: Zap,
  pro: Star,
  gold: Crown,
};

const planColors = {
  free: {
    background: "bg-card",
    border: "border-border",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    icon: "text-gray-600 dark:text-gray-400"
  },
  pro: {
    background: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: "text-blue-600 dark:text-blue-400"
  },
  gold: {
    background: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400"
  },
};

export default function SubscriptionCard({
  planType,
  title,
  price,
  description,
  features,
  isCurrentPlan,
  isPopular = false,
  currentSubscription,
  onUpgrade,
  onManage,
  disabled = false,
  loading = false,
}: SubscriptionCardProps) {
  const IconComponent = planIcons[planType];
  const colors = planColors[planType];

  const handleActionClick = () => {
    if (isCurrentPlan) {
      // User is on this plan - either manage or reactivate
      if (onManage) {
        onManage();
      }
    } else {
      // User wants to switch to this plan (upgrade or downgrade)
      onUpgrade(planType);
    }
  };

  const getButtonText = () => {
    if (loading) return "Processing...";
    if (isCurrentPlan) {
      return currentSubscription?.status === "cancelled" ? "Reactivate Plan" : "Manage Plan";
    }
    // User is not on this plan - show appropriate action
    return planType === "free" ? "Downgrade to Free" : "Upgrade Now";
  };

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg ${colors.background} ${colors.border} ${
        isPopular ? "ring-2 ring-primary shadow-lg scale-105" : ""
      }`}
      data-testid={`subscription-card-${planType}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1" data-testid="popular-badge">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <div className="flex justify-center items-center mb-2">
          <div className={`p-3 rounded-full ${colors.badge}`}>
            <IconComponent className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
        
        <CardTitle className="text-2xl font-bold" data-testid={`title-${planType}`}>
          {title}
        </CardTitle>
        
        <div className="space-y-1">
          <div className="text-4xl font-bold" data-testid={`price-${planType}`}>
            {price}
          </div>
          <CardDescription className="text-sm" data-testid={`description-${planType}`}>
            {description}
          </CardDescription>
        </div>

        {isCurrentPlan && (
          <Badge 
            variant="outline" 
            className={`mx-auto ${colors.badge} border-current`}
            data-testid="current-plan-badge"
          >
            {currentSubscription?.status === "cancelled" ? "Cancelled" : "Current Plan"}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Features included:</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm" data-testid={`feature-${planType}-${index}`}>
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleActionClick}
          disabled={disabled || loading}
          className={`w-full ${
            planType === "gold" 
              ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
              : planType === "pro"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              : isCurrentPlan 
              ? "bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed"
              : ""
          }`}
          variant={isCurrentPlan ? "outline" : "default"}
          data-testid={`action-button-${planType}`}
        >
          {getButtonText()}
        </Button>

        {/* Additional Info */}
        {currentSubscription && isCurrentPlan && currentSubscription.currentPeriodEnd && (
          <div className="text-center text-xs text-muted-foreground" data-testid="renewal-info">
            {currentSubscription.status === "cancelled" 
              ? `Plan expires ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
              : `Renews ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}
