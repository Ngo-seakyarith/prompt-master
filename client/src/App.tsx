import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Dashboard from "@/pages/Dashboard";
import CoursesList from "@/pages/CoursesList";
import CourseDetail from "@/pages/CourseDetail";
import ModuleDetail from "@/pages/ModuleDetail";
import Goals from "@/pages/Goals";
import Certificates from "@/pages/Certificates";
import AIModels from "@/pages/AIModels";
import PlaygroundPage from "@/pages/PlaygroundPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import QuizPage from "@/components/QuizPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/courses" component={CoursesList} />
      <Route path="/courses/:courseId">
        {(params) => <CourseDetail courseId={params.courseId} />}
      </Route>
      <Route path="/modules/:moduleId">
        {(params) => <ModuleDetail moduleId={params.moduleId} />}
      </Route>
      <Route path="/goals" component={Goals} />
      <Route path="/certificates" component={Certificates} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/ai-models" component={AIModels} />
      <Route path="/playground" component={PlaygroundPage} />
      <Route path="/quiz/:quizId">
        {(params) => <QuizPage quizId={params.quizId} />}
      </Route>
      <Route path="/practice" component={Dashboard} />
      <Route path="/progress" component={Dashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
