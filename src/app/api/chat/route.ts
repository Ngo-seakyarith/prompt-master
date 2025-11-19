import { streamChat } from "@/lib/ai/chat-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { convertToModelMessages, type UIMessage } from "ai";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, sessionId, modelId }: { messages: UIMessage[], sessionId?: string, modelId: string } = await req.json();

        if (!modelId) {
            return NextResponse.json(
                { error: "Missing modelId" },
                { status: 400 }
            );
        }

        // Get or create session
        let chatSessionId = sessionId;
        if (!chatSessionId) {
            const newSession = await prisma.chatSession.create({
                data: {
                    userId: session.user.id,
                    title: "New Chat",
                },
            });
            chatSessionId = newSession.id;
        }

        // Save user message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "user") {
            const textPart = lastMessage.parts.find(p => p.type === "text");
            if (textPart && "text" in textPart) {
                await prisma.chatMessage.create({
                    data: {
                        sessionId: chatSessionId,
                        role: "user",
                        content: textPart.text,
                    },
                });
            }
        }

        // Convert UI messages to model messages
        const modelMessages = convertToModelMessages(messages);

        // Stream response
        return streamChat(chatSessionId, modelId, modelMessages);
    } catch (error) {
        console.error("Error in chat route:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        );
    }
}
