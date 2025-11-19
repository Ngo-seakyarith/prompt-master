import { saveUserMessage } from "@/lib/ai/chat-service";
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

        const { sessionId, content } = await req.json();

        if (!sessionId || !content) {
            return NextResponse.json(
                { error: "Missing sessionId or content" },
                { status: 400 }
            );
        }

        const message = await saveUserMessage(sessionId, content);

        return NextResponse.json(message);
    } catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json(
            { error: "Failed to save message" },
            { status: 500 }
        );
    }
}
