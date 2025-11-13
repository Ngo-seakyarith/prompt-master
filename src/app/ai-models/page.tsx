"use client"

import { ExternalLink, Bot, Sparkles, Search, Brain, Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_MODELS, getModelCategories } from "@/lib/aiModels";
import { useState } from "react";
import Link from "next/link";

export default function AIModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const filteredModels = selectedCategory === "all" 
    ? AI_MODELS 
    : AI_MODELS.filter(model => model.category === selectedCategory);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "General Purpose": return <Bot className="w-4 h-4" />;
      case "Productivity": return <Briefcase className="w-4 h-4" />;
      case "Real-time Info": return <Clock className="w-4 h-4" />;
      case "Reasoning": return <Brain className="w-4 h-4" />;
      case "Research": return <Search className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12" data-testid="ai-models-header">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4" data-testid="ai-models-title">
          Key AI Models & Platforms
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="ai-models-description">
          Explore and access the leading AI models and platforms mentioned in our courses. 
          Click any link to visit the official platform and start using these powerful AI tools.
        </p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8" data-testid="category-tabs">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            All Models
          </TabsTrigger>
          {getModelCategories().map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* AI Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" data-testid="ai-models-grid">
        {filteredModels.map((model) => (
          <Card key={model.name} className="hover:shadow-lg transition-shadow" data-testid={`ai-model-card-${model.name.toLowerCase()}`}>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(model.category)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{model.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      by {model.company}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={model.isPremium ? "default" : "secondary"}
                  className={model.isPremium ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" : ""}
                >
                  {model.isPremium ? `${model.price}` : "Free"}
                </Badge>
              </div>
              
              <Badge variant="outline" className="w-fit">
                {model.category}
              </Badge>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {model.description}
              </p>
              
              <Button 
                asChild 
                className="w-full"
                data-testid={`visit-${model.name.toLowerCase()}-button`}
              >
                <a 
                  href={model.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Visit {model.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Tips */}
      <Card className="bg-muted/30" data-testid="usage-tips-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Tips for Using AI Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-sm">🎯 For Learning & Practice:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-4">
                <li>Start with <strong>ChatGPT</strong> or <strong>DeepSeek</strong> for general AI interactions</li>
                <li>Use <strong>Claude</strong> for detailed explanations and reasoning</li>
                <li>Try <strong>Perplexity</strong> for research and fact-checking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">💡 Pro Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-4">
                <li>Apply prompt engineering techniques learned in our courses</li>
                <li>Compare responses across different models for better insights</li>
                <li>Most models offer free tiers perfect for learning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Ready to practice with these AI models? Apply what you&apos;ve learned in our courses!
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="outline" asChild data-testid="back-to-courses-button">
            <Link href="/dashboard">
              <Bot className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="practice-prompts-button">
            <Link href="/playground">
              <Sparkles className="w-4 h-4 mr-2" />
              Try Playground
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
