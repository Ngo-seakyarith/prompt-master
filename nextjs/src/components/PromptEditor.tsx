"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Exercise {
  title: string;
  description: string;
  template?: string;
}

interface PromptEditorProps {
  exercise?: Exercise;
  onAnalyze: (prompt: string) => void;
  isAnalyzing: boolean;
}

export default function PromptEditor({ exercise, onAnalyze, isAnalyzing }: PromptEditorProps) {
  const [prompt, setPrompt] = useState("");

  const handleClear = () => {
    setPrompt("");
  };

  const handleTemplate = () => {
    if (exercise?.template) {
      setPrompt(exercise.template);
    }
  };

  const handleAnalyze = () => {
    if (prompt.trim()) {
      onAnalyze(prompt);
    }
  };

  const wordCount = prompt.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = prompt.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prompt Editor</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTemplate}
              disabled={!exercise?.template}
            >
              Template
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {exercise && (
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">
              Exercise: {exercise.title}
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              {exercise.description}
            </p>
          </div>
        )}
        
        <div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write your prompt here..."
            className="min-h-[200px] font-mono text-sm resize-none"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Characters: {charCount}</span>
            <span>Words: {wordCount}</span>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!prompt.trim() || isAnalyzing}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Prompt"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
