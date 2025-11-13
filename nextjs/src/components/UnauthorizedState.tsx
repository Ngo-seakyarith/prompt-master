"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Chrome, Github } from "lucide-react";

interface UnauthorizedStateProps {
  title?: string;
  description?: string;
  showCard?: boolean;
}

export default function UnauthorizedState({ 
  title, 
  description, 
  showCard = true 
}: UnauthorizedStateProps) {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/sign-in/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "/api/auth/sign-in/github";
  };

  const content = (
    <div className="text-center space-y-6" data-testid="unauthorized-state">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground" data-testid="unauthorized-title">
          {title || "Login Required"}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto" data-testid="unauthorized-description">
          {description || "Please sign in to access this feature and track your progress."}
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleGoogleLogin} 
          className="gap-2 w-full"
          variant="outline"
          data-testid="button-google-login"
        >
          <Chrome className="w-4 h-4" />
          Continue with Google
        </Button>
        
        <Button 
          onClick={handleGithubLogin} 
          className="gap-2 w-full"
          variant="outline"
          data-testid="button-github-login"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        You&apos;ll be redirected back after signing in.
      </p>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="sr-only">Authentication Required</CardTitle>
          <CardDescription className="sr-only">Please log in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </div>
  );
}
