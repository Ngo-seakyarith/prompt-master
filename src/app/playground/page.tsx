"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, Trash2, Send, StopCircle, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  const [input, setInput] = useState("");
  const [streamingIds, setStreamingIds] = useState<string[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

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
  const { data: sessions } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/chat/session");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!session,
  });

  // Get current session messages
  const currentSession = sessions?.find((s: ChatSession) => s.id === selectedSessionId);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (currentSession) {
      setLocalMessages(currentSession.messages);
    } else {
      setLocalMessages([]);
    }
  }, [currentSession]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, streamingIds]);

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
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      setSelectedSessionId(newSession.id);
    },
  });

  // Send Message Logic
  const handleSend = async () => {
    if (!input.trim()) return;
    if (selectedModels.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    const userMessageContent = input;
    setInput("");

    let sessionId = selectedSessionId;

    // Create session if needed
    if (!sessionId) {
      try {
        const newSession = await createSessionMutation.mutateAsync(userMessageContent.slice(0, 30) + "...");
        sessionId = newSession.id;
      } catch (error) {
        toast.error("Failed to create session");
        return;
      }
    }

    // Optimistic User Message
    const tempUserMsgId = Date.now().toString();
    const userMsg: Message = {
      id: tempUserMsgId,
      role: "user",
      content: userMessageContent,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);

    // Save User Message
    try {
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: userMessageContent }),
      });
    } catch (error) {
      console.error("Failed to save user message", error);
    }

    // Stream Responses
    selectedModels.forEach(async (modelId) => {
      const assistantMsgId = `${Date.now()}-${modelId}`;
      setStreamingIds((prev) => [...prev, assistantMsgId]);

      // Optimistic Assistant Message
      setLocalMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          modelId,
          createdAt: new Date().toISOString(),
        },
      ]);

      const controller = new AbortController();
      abortControllers.current.set(assistantMsgId, controller);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, modelId }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Stream failed");
        if (!res.body) throw new Error("No body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          // Parse AI SDK stream format (simple approximation)
          // AI SDK stream sends parts like "0:text"
          // We need to parse this. For now, let's assume raw text or simple parsing
          // Actually, toDataStreamResponse returns a specific format.
          // Let's try to just append the raw chunk for now and refine if needed, 
          // or better, use a library to parse it. 
          // Since we are doing manual fetch, we might get raw text if we didn't use toDataStreamResponse,
          // but we did.

          // Raw text stream
          setLocalMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          toast.error(`Error streaming ${modelId}`);
        }
      } finally {
        setStreamingIds((prev) => prev.filter((id) => id !== assistantMsgId));
        abortControllers.current.delete(assistantMsgId);
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] }); // Refresh to get saved state
      }
    });
  };

  const handleStop = () => {
    abortControllers.current.forEach((controller) => controller.abort());
    abortControllers.current.clear();
    setStreamingIds([]);
  };

  if (isAuthPending) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!session) {
    router.push("/");
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
              setLocalMessages([]);
              setInput("");
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
                <MessageSquare className="h-4 w-4 opacity-50" />
                <span className="truncate flex-1">{s.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b flex items-center px-6 justify-between">
          <div className="font-semibold">
            {selectedSessionId ? sessions?.find((s: any) => s.id === selectedSessionId)?.title : "New Chat"}
          </div>
          <div className="flex items-center gap-2">
            {/* Model Selector in Header? Or Input? Let's keep it in Input for context */}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6">
            {localMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className={cn(
                  "rounded-lg p-4 max-w-[80%]",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border"
                )}>
                  {msg.role === "assistant" && msg.modelId && (
                    <div className="text-xs font-medium mb-1 opacity-70">
                      {models?.find((m: any) => m.id === msg.modelId)?.name || msg.modelId}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                    {streamingIds.includes(msg.id) && (
                      <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <UserIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {localMessages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">Welcome to AI Chat</h3>
                <p>Select a model and start a conversation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="max-w-3xl mx-auto">
            <PromptInput
              onSubmit={handleSend}
            >
              <PromptInputHeader>
                <PromptInputTools>
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

                  {selectedModels.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {selectedModels.map((modelId) => {
                        const model = models?.find((m: any) => m.id === modelId);
                        if (!model) return null;
                        return (
                          <div
                            key={modelId}
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-muted/50"
                          >
                            <span className="truncate max-w-[100px]">{model.name}</span>
                            <button
                              onClick={() => setSelectedModels(prev => prev.filter(id => id !== modelId))}
                              className="hover:text-foreground"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </PromptInputTools>
              </PromptInputHeader>
              <PromptInputBody>
                <PromptInputTextarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </PromptInputBody>
              <PromptInputFooter>
                {streamingIds.length > 0 ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleStop}
                    className="ml-auto"
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Generating
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    className="ml-auto"
                    disabled={!input.trim() || selectedModels.length === 0}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                )}
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
