import { streamChat, getChatHistory } from "@/lib/ai/chat-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, modelId } = await req.json();

        if (!sessionId || !modelId) {
            return NextResponse.json(
                { error: "Missing sessionId or modelId" },
                { status: 400 }
            );
        }

        // Fetch history from DB
        const history = await getChatHistory(sessionId);

        // Stream response
        return streamChat(sessionId, modelId, history);
    } catch (error) {
        console.error("Error in chat route:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        );
    }
}
