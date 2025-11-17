"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Loader2, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputTools,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorItem,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";

export default function PlaygroundPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const { data: models } = useQuery({
    queryKey: ["playground-models"],
    queryFn: async () => {
      const res = await fetch("/api/playground/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      return res.json();
    },
    enabled: !!session,
  });

  const { data: tests } = useQuery({
    queryKey: ["playground-tests"],
    queryFn: async () => {
      const res = await fetch("/api/playground/test");
      if (!res.ok) throw new Error("Failed to fetch tests");
      return res.json();
    },
    enabled: !!session,
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
      // Refresh tests data
      queryClient.invalidateQueries({ queryKey: ["playground-tests"] });
    },
    onError: () => {
      toast.error("Failed to run test");
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/");
    return null;
  }

  const handleRunTest = (promptText: string) => {
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
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Playground</h1>
          <p className="text-muted-foreground">Test and compare multiple AI models</p>
        </div>

        <div className="space-y-6">
          {/* Prompt and Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>Enter your prompt to test</CardDescription>
              </CardHeader>
              <CardContent>
                <PromptInput
                  onSubmit={({ text }) => {
                    handleRunTest(text);
                  }}
                >
                  <PromptInputHeader>
                    <div className="flex flex-col gap-1 w-full">
                      <PromptInputTools>
                        <span className="text-xs text-muted-foreground">Models</span>
                        <ModelSelector>
                          <ModelSelectorTrigger asChild>
                            <PromptInputButton variant="outline" size="sm">
                              {selectedModels.length > 0
                                ? `${selectedModels.length} model${selectedModels.length > 1 ? "s" : ""} selected`
                                : "Select models"}
                            </PromptInputButton>
                          </ModelSelectorTrigger>
                          <ModelSelectorContent title="Select models">
                            <ModelSelectorInput placeholder="Search models..." />
                            <ModelSelectorList>
                              <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                              {models?.map((model: any) => (
                                <ModelSelectorItem
                                  key={model.id}
                                  onSelect={() => {
                                    setSelectedModels((prev) =>
                                      prev.includes(model.id)
                                        ? prev.filter((id) => id !== model.id)
                                        : [...prev, model.id]
                                    );
                                  }}
                                >
                                  <ModelSelectorName>{model.name}</ModelSelectorName>
                                </ModelSelectorItem>
                              ))}
                            </ModelSelectorList>
                          </ModelSelectorContent>
                        </ModelSelector>
                      </PromptInputTools>
                      {selectedModels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedModels.map((modelId) => {
                            const model = models?.find((m: any) => m.id === modelId);
                            if (!model) return null;
                            return (
                              <button
                                key={modelId}
                                type="button"
                                onClick={() =>
                                  setSelectedModels((prev) =>
                                    prev.filter((id) => id !== modelId)
                                  )
                                }
                                className="inline-flex max-w-xs items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                <span className="truncate">{model.name}</span>
                                <span className="text-xs leading-none">&times;</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </PromptInputHeader>
                  <PromptInputBody>
                    <PromptInputTextarea placeholder="Enter your prompt here..." />
                  </PromptInputBody>
                  <PromptInputFooter>
                    <Button
                      type="submit"
                      className="ml-auto"
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
                  </PromptInputFooter>
                </PromptInput>
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

