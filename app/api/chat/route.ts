import { NextRequest, NextResponse } from "next/server";

// Type definitions for request/response
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

interface ChatResponse {
  success: boolean;
  assistant?: string;
  error?: string;
  errorCode?: string;
}

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse>> {
  try {
    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse the request body
    const body: ChatRequest = await request.json();

    // Validate request body
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body. Expected { messages: [{ role, content }] }",
        },
        { status: 400 }
      );
    }

    // Validate message structure
    for (const message of body.messages) {
      if (
        !message.role ||
        !message.content ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid message format. Each message must have role and content.",
          },
          { status: 400 }
        );
      }
    }

    // Convert to Gemini request format
    // For now, let's send only the last user message to keep it simple
    const lastUserMessage = body.messages
      .filter((msg) => msg.role === "user")
      .pop();
    if (!lastUserMessage) {
      return NextResponse.json(
        { success: false, error: "No user message found" },
        { status: 400 }
      );
    }

    const geminiRequest: GeminiRequest = {
      contents: [
        {
          parts: [{ text: lastUserMessage.content }],
        },
      ],
    };

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);

      // Handle specific error codes
      if (geminiResponse.status === 503) {
        return NextResponse.json(
          {
            success: false,
            error:
              "AI service is temporarily overloaded. Please try again in a few moments.",
            errorCode: "SERVICE_OVERLOADED",
          },
          { status: 503 }
        );
      } else if (geminiResponse.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Rate limit exceeded. Please wait a moment before trying again.",
            errorCode: "RATE_LIMIT_EXCEEDED",
          },
          { status: 429 }
        );
      } else if (geminiResponse.status === 400) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request. Please check your message and try again.",
            errorCode: "INVALID_REQUEST",
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error:
              "AI service is temporarily unavailable. Please try again later.",
            errorCode: "SERVICE_UNAVAILABLE",
          },
          { status: 500 }
        );
      }
    }

    const geminiData: GeminiResponse = await geminiResponse.json();

    // Parse Gemini response
    if (geminiData.error) {
      console.error("Gemini API error:", geminiData.error);
      return NextResponse.json(
        { success: false, error: "AI service returned an error" },
        { status: 500 }
      );
    }

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error("No candidates in Gemini response:", geminiData);
      return NextResponse.json(
        { success: false, error: "No response generated" },
        { status: 500 }
      );
    }

    const assistantText = geminiData.candidates[0]?.content?.parts?.[0]?.text;
    if (!assistantText) {
      console.error("No text in Gemini response:", geminiData);
      return NextResponse.json(
        { success: false, error: "Empty response from AI service" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, assistant: assistantText },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
Local testing with curl:

curl -X POST http://localhost:3004/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Hello! Can you help me write a Python function?" }
    ]
  }'

Expected response:
{
  "success": true,
  "assistant": "Of course! I'd be happy to help you write a Python function..."
}
*/
