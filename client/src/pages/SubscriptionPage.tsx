import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import SubscriptionCard from "@/components/SubscriptionCard";
import UsageDisplay from "@/components/UsageDisplay";
import BillingHistory from "@/components/BillingHistory";
import UnauthorizedState from "@/components/UnauthorizedState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Crown, Star, Zap, CreditCard, TrendingUp, Settings } from "lucide-react";
import type { UserSubscription, DailyUsage } from "@shared/schema";

export default function SubscriptionPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch subscription data
  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useQuery<UserSubscription>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
    retry: false
  });

  // Fetch daily usage data
  const { data: usageData, isLoading: usageLoading, error: usageError } = useQuery<{
    usage: DailyUsage;
    subscription: UserSubscription;
    date: string;
  }>({
    queryKey: ["/api/usage/daily"],
    enabled: isAuthenticated,
    retry: false
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest("POST", "/api/billing/create-checkout-session", { plan });
      return response.json();
    },
    onMutate: () => {
      setIsUpgrading(true);
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast({
          title: "Stripe Integration Coming Soon",
          description: "Full payment processing will be available in the next release.",
          variant: "default"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed", 
        description: error.message || "Failed to initiate upgrade process",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUpgrading(false);
    }
  });

  const handleUpgrade = (planType: string) => {
    if (planType === "free") {
      toast({
        title: "Already on Free Plan",
        description: "You're currently on the free plan. Consider upgrading for more features!",
        variant: "default"
      });
      return;
    }
    upgradeMutation.mutate(planType);
  };

  const handleManageSubscription = () => {
    toast({
      title: "Subscription Management Coming Soon",
      description: "Full subscription management will be available in a future update.",
      variant: "default"
    });
  };

  // Plan configurations
  const plans = [
    {
      planType: "free" as const,
      title: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "5 daily prompts for learning",
        "Access to basic tutorials",
        "Community support",
        "Basic progress tracking",
        "Limited AI feedback"
      ],
      isPopular: false
    },
    {
      planType: "pro" as const,
      title: "Pro",
      price: "$10",
      description: "Best for serious learners",
      features: [
        "Unlimited daily prompts",
        "Access to 1 premium course",
        "Advanced AI feedback",
        "Detailed progress analytics",
        "Priority support",
        "20 playground tests/day"
      ],
      isPopular: true
    },
    {
      planType: "gold" as const,
      title: "Gold",
      price: "$15", 
      description: "Full access to everything",
      features: [
        "Unlimited daily prompts",
        "Access to ALL courses",
        "Advanced AI feedback",
        "Detailed progress analytics",
        "Premium support",
        "Unlimited playground tests",
        "Early access to new features"
      ],
      isPopular: false
    }
  ];

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
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
          title="Subscription Management"
          description="Please log in to view and manage your subscription."
        />
      </div>
    );
  }

  // Handle API errors
  if (subscriptionError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Unable to Load Subscription</h2>
              <p className="text-muted-foreground mb-6">
                There was an error loading your subscription information.
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/subscription"] })}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLoading = subscriptionLoading || usageLoading;
  const currentPlan = subscription?.plan || "free";

  return (
    <div className="min-h-screen bg-background" data-testid="subscription-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12" data-testid="subscription-header">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold" data-testid="page-title">
              Subscription & Billing
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-subtitle">
            Manage your subscription, view usage statistics, and upgrade your plan to unlock more features.
          </p>
          
          {subscription && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge 
                variant="outline" 
                className="text-sm px-4 py-2"
                data-testid="current-plan-indicator"
              >
                Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
              </Badge>
              
              {subscription.status !== "active" && (
                <Badge variant="destructive" data-testid="inactive-status">
                  {subscription.status}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="plans" className="space-y-8" data-testid="subscription-tabs">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="plans" data-testid="tab-plans">
              <Crown className="w-4 h-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="usage" data-testid="tab-usage">
              <TrendingUp className="w-4 h-4 mr-2" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-8" data-testid="plans-content">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select the plan that best fits your learning needs and goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="plans-grid">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.planType}
                  planType={plan.planType}
                  title={plan.title}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  isCurrentPlan={currentPlan === plan.planType}
                  isPopular={plan.isPopular}
                  currentSubscription={subscription}
                  onUpgrade={handleUpgrade}
                  onManage={handleManageSubscription}
                  disabled={isUpgrading}
                  loading={isUpgrading}
                />
              ))}
            </div>

            {/* Plan Comparison */}
            <Card className="mt-12" data-testid="plan-comparison">
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
                <CardDescription>
                  Compare what's included in each plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Feature</th>
                        <th className="text-center py-2">Free</th>
                        <th className="text-center py-2">Pro</th>
                        <th className="text-center py-2">Gold</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2">Daily Prompts</td>
                        <td className="text-center">5</td>
                        <td className="text-center">Unlimited</td>
                        <td className="text-center">Unlimited</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Course Access</td>
                        <td className="text-center">None</td>
                        <td className="text-center">1 Course</td>
                        <td className="text-center">All Courses</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Playground Tests</td>
                        <td className="text-center">3/day</td>
                        <td className="text-center">20/day</td>
                        <td className="text-center">Unlimited</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Support</td>
                        <td className="text-center">Community</td>
                        <td className="text-center">Priority</td>
                        <td className="text-center">Premium</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-8" data-testid="usage-content">
            {subscription ? (
              <UsageDisplay 
                subscription={subscription}
                dailyUsage={usageData?.usage || null}
                isLoading={usageLoading}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    {isLoading ? "Loading usage data..." : "Unable to load usage information"}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-8" data-testid="billing-content">
            <BillingHistory />
          </TabsContent>
        </Tabs>

        {/* Additional Information */}
        <Card className="mt-12 bg-muted/30" data-testid="subscription-info">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Have questions about your subscription or need assistance with billing? 
                  Our support team is here to help.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" data-testid="contact-support">
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm" data-testid="view-faq">
                    View FAQ
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}