import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, CoreMessage } from "ai";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_MODELS } from "@/lib/openrouter";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function streamChat(
    sessionId: string,
    modelId: string,
    messages: CoreMessage[],
    enableWebSearch: boolean = false
) {
    const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (!modelConfig) {
        throw new Error(`Model ${modelId} not found`);
    }

    const result = streamText({
        model: openrouter(enableWebSearch ? `${modelId}:online` : modelId),
        messages,
        // Optional: Use explicit plugin configuration for more control
        ...(enableWebSearch && {
            experimental_providerMetadata: {
                openrouter: {
                    plugins: [
                        {
                            type: "web_search",
                            max_results: 8,
                        }
                    ]
                }
            }
        }),
        onFinish: async ({ text, usage }) => {
            // Save assistant message to DB
            await prisma.chatMessage.create({
                data: {
                    sessionId,
                    role: "assistant",
                    content: text,
                    modelId,
                    promptTokens: (usage as { promptTokens?: number })?.promptTokens ?? 0,
                    completionTokens: (usage as { completionTokens?: number })?.completionTokens ?? 0,
                    cost: modelConfig.creditCost, // Simplified cost for now, can be more granular later
                },
            });

            // Update usage stats (optional, can be done async)
            // await updateUsageStats(userId, modelConfig.creditCost);
        },
    });

    return result.toUIMessageStreamResponse();
}

export async function getChatHistory(sessionId: string): Promise<CoreMessage[]> {
    const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
    });

    return messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
    }));
}

export async function createChatSession(userId: string, title: string) {
    return prisma.chatSession.create({
        data: {
            userId,
            title,
        },
    });
}

export async function saveUserMessage(sessionId: string, content: string) {
    return prisma.chatMessage.create({
        data: {
            sessionId,
            role: "user",
            content,
        },
    });
}
