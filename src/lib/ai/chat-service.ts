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
    messages: CoreMessage[]
) {
    const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (!modelConfig) {
        throw new Error(`Model ${modelId} not found`);
    }

    const result = streamText({
        model: openrouter(modelId),
        messages,
        onFinish: async ({ text, usage }) => {
            // Save assistant message to DB
            await prisma.chatMessage.create({
                data: {
                    sessionId,
                    role: "assistant",
                    content: text,
                    modelId,
                    promptTokens: (usage as any).promptTokens,
                    completionTokens: (usage as any).completionTokens,
                    cost: modelConfig.creditCost, // Simplified cost for now, can be more granular later
                },
            });

            // Update usage stats (optional, can be done async)
            // await updateUsageStats(userId, modelConfig.creditCost);
        },
    });

    return result.toTextStreamResponse();
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
