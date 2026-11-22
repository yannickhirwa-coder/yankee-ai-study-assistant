
import { NextResponse } from "next/server";

function cleanAIResponse(answer: string): string {
  return answer
    // Remove complete internal thinking blocks.
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "")
    // Remove an incomplete thinking block and everything after it.
    .replace(/<think\b[^>]*>[\s\S]*$/gi, "")
    // Remove any remaining closing tags.
    .replace(/<\/think>/gi, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.DIFY_API_KEY;
    const baseUrl = process.env.DIFY_API_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: "Dify configuration is missing." },
        { status: 500 }
      );
    }

    const { query, conversation_id, user } = await request.json();

    if (
      typeof query !== "string" ||
      !query.trim() ||
      typeof user !== "string" ||
      !user.trim()
    ) {
      return NextResponse.json(
        { error: "A valid question and user ID are required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/chat-messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query: query.trim(),
          response_mode: "blocking",
          user,
          ...(conversation_id ? { conversation_id } : {}),
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Dify error:", data);
      return NextResponse.json(
        { error: "Dify could not process the request." },
        { status: response.status }
      );
    }

    const answer =
      typeof data.answer === "string"
        ? cleanAIResponse(data.answer)
        : "";

    if (!answer) {
      return NextResponse.json(
        { error: "The AI returned no user-facing answer. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      answer,
      conversation_id: data.conversation_id,
      message_id: data.message_id,
    });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      { error: "Unable to contact the AI tutor." },
      { status: 500 }
    );
  }
}
