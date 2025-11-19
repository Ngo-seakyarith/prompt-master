"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelId?: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

export default function ChatPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch Models
  const { data: models } = useQuery({
    queryKey: ["playground-models"],
    queryFn: async () => {
      const res = await fetch("/api/playground/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      return res.json();
    },
    enabled: !!session,
  });

  // Fetch Sessions
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/chat/session");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!session,
  });

  // Get current session
  const currentSession = sessions?.find((s: ChatSession) => s.id === selectedSessionId);
  const messages = currentSession?.messages || [];

  // Create Session Mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return res.json();
    },
    onSuccess: (newSession) => {
      refetchSessions();
      setSelectedSessionId(newSession.id);
    },
  });

  // Send Message
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    if (selectedModels.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    setIsStreaming(true);
    let sessionId = selectedSessionId;

    // Create session if needed
    if (!sessionId) {
      try {
        const newSession = await createSessionMutation.mutateAsync(text.slice(0, 50) + "...");
        sessionId = newSession.id;
      } catch (error) {
        toast.error("Failed to create session");
        setIsStreaming(false);
        return;
      }
    }

    // Save User Message
    try {
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: text }),
      });
    } catch (error) {
      console.error("Failed to save user message", error);
    }

    // Stream Responses from all selected models
    try {
      await Promise.all(
        selectedModels.map(async (modelId) => {
          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, modelId }),
            });

            if (!res.ok) throw new Error("Stream failed");

            // Consume the stream
            if (res.body) {
              const reader = res.body.getReader();
              const decoder = new TextDecoder();

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                decoder.decode(value, { stream: true });
              }
            }
          } catch (error) {
            console.error(`Error streaming ${modelId}:`, error);
            toast.error(`Error with ${modelId}`);
          }
        })
      );
    } finally {
      setIsStreaming(false);
      // Refetch to get updated messages
      refetchSessions();
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/");
    }
  }, [isAuthPending, session, router]);

  if (isAuthPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 flex flex-col">
        <div className="p-4">
          <Button
            onClick={() => {
              setSelectedSessionId(null);
            }}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1">
            {sessions?.map((s: ChatSession) => (
              <button
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                  selectedSessionId === s.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                )}
              >
                <MessageSquare className="h-4 w-4 opacity-50 shrink-0" />
                <span className="truncate flex-1">{s.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b flex items-center px-6">
          <div className="font-semibold">
            {selectedSessionId ? currentSession?.title : "New Chat"}
          </div>
        </div>

        {/* Messages */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="h-12 w-12 opacity-20" />}
                title="Welcome to AI Chat"
                description="Select a model and start a conversation."
              />
            ) : (
              messages.map((msg: Message) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>
                    {msg.role === "assistant" && msg.modelId && (
                      <div className="text-xs font-medium mb-1 opacity-70">
                        {models?.find((m: any) => m.id === msg.modelId)?.name || msg.modelId}
                      </div>
                    )}
                    <MessageResponse>{msg.content}</MessageResponse>
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="max-w-3xl mx-auto">
            <PromptInput onSubmit={({ text }) => handleSend(text)}>
              <PromptInputHeader>
                <PromptInputTools>
                  <ModelSelector>
                    <ModelSelectorTrigger asChild>
                      <PromptInputButton variant="outline" size="sm">
                        {selectedModels.length > 0
                          ? `${selectedModels.length} model${selectedModels.length > 1 ? "s" : ""}`
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

                  {selectedModels.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {selectedModels.map((modelId) => {
                        const model = models?.find((m: any) => m.id === modelId);
                        if (!model) return null;
                        return (
                          <button
                            key={modelId}
                            type="button"
                            onClick={() => setSelectedModels(prev => prev.filter(id => id !== modelId))}
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-muted/50 hover:bg-muted"
                          >
                            <span className="truncate max-w-[100px]">{model.name}</span>
                            <span className="text-xs">&times;</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </PromptInputTools>
              </PromptInputHeader>
              <PromptInputBody>
                <PromptInputTextarea
                  placeholder="Type your message..."
                />
              </PromptInputBody>
              <PromptInputFooter>
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={isStreaming}
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
