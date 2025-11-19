"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery } from "@tanstack/react-query";
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

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const router = useRouter();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

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

  // Use AI SDK useChat hook with unique ID per session
  const { messages, sendMessage, status, setMessages } = useChat({
    id: selectedSessionId || "new-chat",
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, options) => {
        if (!selectedModel) {
          throw new Error("Please select a model first");
        }
        const body = JSON.parse(options?.body as string || "{}");
        return fetch(url, {
          ...options,
          body: JSON.stringify({
            ...body,
            sessionId: selectedSessionId,
            modelId: selectedModel,
          }),
        });
      },
    }),
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to send message");
    },
    onFinish: () => {
      refetchSessions();
    },
  });

  // Load messages when session changes
  useEffect(() => {
    if (selectedSessionId && sessions) {
      const session = sessions.find((s: ChatSession & { messages?: Array<{ id: string; role: string; content: string; createdAt: string }> }) => s.id === selectedSessionId);
      if (session?.messages) {
        // Convert old messages to UIMessage format
        const uiMessages = session.messages.map((msg: { id: string; role: string; content: string; createdAt: string; modelId?: string }) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: "text" as const, text: msg.content }],
          createdAt: msg.createdAt,
          // Attach modelId so UI can render correct model label for assistant messages
          modelId: msg.modelId ?? undefined,
        }));
        setMessages(uiMessages);
      }
    } else {
      setMessages([]);
    }
  }, [selectedSessionId, sessions, setMessages]);

  // Handle send
  const handleSend = (text: string) => {
    if (!text.trim()) return;
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    sendMessage({ text });
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
              setMessages([]);
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
            {selectedSessionId ? (sessions?.find((s: ChatSession) => s.id === selectedSessionId)?.title || "Chat") : "New Chat"}
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
              messages.map((msg) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>
                    {msg.role === "assistant" && (
                      <div className="text-xs font-medium mb-1 opacity-70">
                        {(() => {
                          const msgModelId = (msg as unknown as { modelId?: string }).modelId;
                          return (
                            models?.find((m: { id: string; name: string }) => m.id === msgModelId)?.name
                            || models?.find((m: { id: string; name: string }) => m.id === selectedModel)?.name
                            || selectedModel
                          );
                        })()}
                      </div>
                    )}
                    <MessageResponse>
                      {msg.parts.map((part) => {
                        if (part.type === "text") {
                          return part.text;
                        }
                        return null;
                      }).join("")}
                    </MessageResponse>
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
                        {selectedModel
                          ? models?.find((m: { id: string; name: string }) => m.id === selectedModel)?.name || "Select model"
                          : "Select model"}
                      </PromptInputButton>
                    </ModelSelectorTrigger>
                    <ModelSelectorContent title="Select model">
                      <ModelSelectorInput placeholder="Search models..." />
                      <ModelSelectorList>
                        <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                        {models?.map((model: { id: string; name: string }) => (
                          <ModelSelectorItem
                            key={model.id}
                            onSelect={() => {
                              setSelectedModel(model.id);
                            }}
                          >
                            <ModelSelectorName>{model.name}</ModelSelectorName>
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorList>
                    </ModelSelectorContent>
                  </ModelSelector>
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
                  disabled={status !== "ready"}
                >
                  {status !== "ready" ? (
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
