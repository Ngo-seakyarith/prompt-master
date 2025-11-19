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
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
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
  ModelSelectorGroup,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
} from "@/components/ai-elements/model-selector";
import { GlobeIcon, CheckIcon } from "lucide-react";
import type { ModelConfig } from "@/lib/openrouter";

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
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

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

  // Set default model on initial load
  const defaultModel = models && models.length > 0 ? models[0].id : null;
  if (!selectedModel && defaultModel) {
    setSelectedModel(defaultModel);
  }

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

  // Handle send with attachments
  const handleSend = async (message: PromptInputMessage) => {
    const { text, files } = message;
    const hasText = Boolean(text?.trim());
    const hasAttachments = Boolean(files && files.length > 0);

    if (!(hasText || hasAttachments)) return;
    
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    // Convert FileList or FileUIPart[] to file parts
    let fileParts: Array<{
      type: "file";
      filename: string;
      mediaType: string;
      url: string;
    }> = [];

    if (files && files.length > 0) {
      // Check if files is FileList or FileUIPart[]
      if (files instanceof FileList) {
        fileParts = await convertFilesToParts(files);
      } else {
        // Already FileUIPart[], map to our format
        fileParts = files.map(f => ({
          type: "file" as const,
          filename: f.filename || "file",
          mediaType: f.mediaType || "application/octet-stream",
          url: f.url,
        }));
      }
    }

    // Build message parts array
    const parts = [
      ...(text ? [{ type: "text" as const, text }] : []),
      ...fileParts,
    ];

    sendMessage(
      {
        role: "user",
        parts,
      },
      {
        body: {
          sessionId: selectedSessionId,
          modelId: selectedModel,
        },
      }
    );
  };

  // Helper function to convert FileList to parts
  const convertFilesToParts = async (files: FileList) => {
    const parts = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await fileToDataURL(file);
      parts.push({
        type: "file" as const,
        filename: file.name,
        mediaType: file.type,
        url: dataUrl,
      });
    }
    return parts;
  };

  // Helper function to convert file to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
            <PromptInputProvider>
              <PromptInput
                globalDrop
                multiple
                onSubmit={handleSend}
                className="bg-background"
              >
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="What would you like to know?"
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                    <PromptInputSpeechButton />
                    <PromptInputButton>
                      <GlobeIcon size={16} />
                      <span>Search</span>
                    </PromptInputButton>
                    <ModelSelector
                      open={modelSelectorOpen}
                      onOpenChange={setModelSelectorOpen}
                    >
                      <ModelSelectorTrigger asChild>
                        <PromptInputButton size="sm">
                          {selectedModel && models && (() => {
                            const model = models.find((m: ModelConfig) => m.id === selectedModel);
                            if (!model) return null;
                            return (
                              <>
                                <ModelSelectorLogo provider={model.chefSlug} />
                                <ModelSelectorName>{model.name}</ModelSelectorName>
                              </>
                            );
                          })()}
                        </PromptInputButton>
                      </ModelSelectorTrigger>
                      <ModelSelectorContent title="Select model">
                        <ModelSelectorInput placeholder="Search models..." />
                        <ModelSelectorList>
                          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                          {models && Array.from(new Set(models.map((m: ModelConfig) => m.chef))).map((chef) => (
                            <ModelSelectorGroup heading={chef as string} key={chef as string}>
                              {models
                                .filter((m: ModelConfig) => m.chef === chef)
                                .map((model: ModelConfig) => (
                                  <ModelSelectorItem
                                    key={model.id}
                                    value={model.id}
                                    onSelect={() => {
                                      setSelectedModel(model.id);
                                      setModelSelectorOpen(false);
                                    }}
                                  >
                                    <ModelSelectorLogo provider={model.chefSlug} />
                                    <ModelSelectorName>{model.name}</ModelSelectorName>
                                    <ModelSelectorLogoGroup>
                                      {model.providers.map((provider: string) => (
                                        <ModelSelectorLogo
                                          key={provider}
                                          provider={provider}
                                        />
                                      ))}
                                    </ModelSelectorLogoGroup>
                                    {selectedModel === model.id ? (
                                      <CheckIcon className="ml-auto size-4" />
                                    ) : (
                                      <div className="ml-auto size-4" />
                                    )}
                                  </ModelSelectorItem>
                                ))}
                            </ModelSelectorGroup>
                          ))}
                        </ModelSelectorList>
                      </ModelSelectorContent>
                    </ModelSelector>
                  </PromptInputTools>
                  <PromptInputSubmit status={status} />
                </PromptInputFooter>
              </PromptInput>
            </PromptInputProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
