"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Loader2, DollarSign, Clock, Award } from "lucide-react";
import { toast } from "sonner";

export default function PlaygroundPage() {
  const [promptText, setPromptText] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);

  const { data: models } = useQuery({
    queryKey: ["playground-models"],
    queryFn: async () => {
      const res = await fetch("/api/playground/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      return res.json();
    },
  });

  const { data: tests } = useQuery({
    queryKey: ["playground-tests"],
    queryFn: async () => {
      const res = await fetch("/api/playground/test");
      if (!res.ok) throw new Error("Failed to fetch tests");
      return res.json();
    },
  });

  const runTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/playground/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to run test");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Test completed successfully!");
    },
    onError: () => {
      toast.error("Failed to run test");
    },
  });

  const handleRunTest = () => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    if (selectedModels.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    runTestMutation.mutate({
      promptText,
      models: selectedModels,
      parameters: {
        temperature: temperature[0],
        maxTokens: maxTokens[0],
        topP: 1,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Playground</h1>
          <p className="text-muted-foreground">Test and compare multiple AI models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Configure your test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Models</label>
                  <Select
                    value={selectedModels[0]}
                    onValueChange={(value) => {
                      if (!selectedModels.includes(value)) {
                        setSelectedModels([...selectedModels, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select models" />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model: any) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedModels.map((modelId) => {
                      const model = models?.find((m: any) => m.id === modelId);
                      return (
                        <Badge key={modelId} variant="secondary">
                          {model?.name}
                          <button
                            onClick={() => setSelectedModels(selectedModels.filter(m => m !== modelId))}
                            className="ml-2"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Temperature: {temperature[0].toFixed(2)}
                  </label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Tokens: {maxTokens[0]}
                  </label>
                  <Slider
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    min={100}
                    max={4000}
                    step={100}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Prompt and Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>Enter your prompt to test</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="min-h-[200px]"
                />
                <Button 
                  onClick={handleRunTest} 
                  className="mt-4 w-full"
                  disabled={runTestMutation.isPending}
                >
                  {runTestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {runTestMutation.data && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Total Cost: ${runTestMutation.data.totalCost}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="0">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${runTestMutation.data.results.length}, 1fr)` }}>
                      {runTestMutation.data.results.map((result: any, idx: number) => (
                        <TabsTrigger key={idx} value={idx.toString()}>
                          {result.modelName.split('/').pop()}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {runTestMutation.data.results.map((result: any, idx: number) => (
                      <TabsContent key={idx} value={idx.toString()}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              {result.responseTime}ms
                            </Badge>
                            <Badge variant="outline">
                              <DollarSign className="mr-1 h-3 w-3" />
                              ${result.cost}
                            </Badge>
                            <Badge variant="outline">
                              {result.tokenCount} tokens
                            </Badge>
                          </div>
                          <Separator />
                          <ScrollArea className="h-[400px]">
                            <div className="whitespace-pre-wrap">
                              {result.error || result.response}
                            </div>
                          </ScrollArea>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests?.slice(0, 6).map((test: any) => (
              <Card key={test.id}>
                <CardHeader>
                  <CardTitle className="text-base truncate">{test.promptText}</CardTitle>
                  <CardDescription>
                    {new Date(test.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>{test.models.length} models</span>
                    <span className="font-medium">${test.totalCost}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
