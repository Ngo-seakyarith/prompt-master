import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Lock, LogIn } from "lucide-react";

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
  const { t } = useTranslation();

  const handleLogin = () => {
    // Redirect to Better Auth Google login
    window.location.href = "/api/auth/sign-in/google";
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
          {title || t("auth.loginRequired")}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto" data-testid="unauthorized-description">
          {description || t("auth.loginRequiredDescription")}
        </p>
      </div>
      
      <Button 
        onClick={handleLogin} 
        className="gap-2"
        data-testid="button-login"
      >
        <LogIn className="w-4 h-4" />
        {t("auth.loginButton")}
      </Button>
      
      <p className="text-sm text-muted-foreground">
        {t("auth.loginRedirectNotice")}
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