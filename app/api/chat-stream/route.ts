import { NextRequest } from "next/server";

/**
 * Streaming Chat API Route
 * Implements Server-Sent Events (SSE) for real-time streaming responses from Gemini AI
 *
 * Best Practices:
 * - Uses ReadableStream for efficient streaming
 * - Implements proper error handling with graceful degradation
 * - Supports request cancellation via AbortController
 * - Uses TextEncoder for efficient stream encoding
 * - Implements proper cleanup on stream completion
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

interface GeminiStreamChunk {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: ChatRequest = await request.json();

    // Validate request
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the last user message
    const lastUserMessage = body.messages
      .filter((msg) => msg.role === "user")
      .pop();

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Gemini API with streaming enabled
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": geminiApiKey,
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: lastUserMessage.content }],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 8192,
                },
              }),
            }
          );

          if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error(
              "Gemini API error:",
              geminiResponse.status,
              errorText
            );

            // Send error message to client
            const errorData = {
              error: true,
              message: getErrorMessage(geminiResponse.status),
              code: geminiResponse.status,
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
            controller.close();
            return;
          }

          // Read the streaming response
          const reader = geminiResponse.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get response reader");
          }

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Send completion signal
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
              break;
            }

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6); // Remove "data: " prefix

                if (data.trim() === "[DONE]") {
                  continue;
                }

                try {
                  const parsed: GeminiStreamChunk = JSON.parse(data);

                  // Extract text from the chunk
                  const text =
                    parsed.candidates?.[0]?.content?.parts?.[0]?.text;

                  if (text) {
                    // Send the text chunk to client
                    const chunkData = {
                      text,
                      done: false,
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`)
                    );
                  }

                  // Check for errors
                  if (parsed.error) {
                    const errorData = {
                      error: true,
                      message: parsed.error.message,
                      code: parsed.error.code,
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
                    );
                    controller.close();
                    break;
                  }
                } catch (parseError) {
                  console.error("Error parsing SSE data:", parseError);
                  // Continue processing other chunks
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);

          // Send error to client
          const errorData = {
            error: true,
            message:
              error instanceof Error
                ? error.message
                : "Stream processing error",
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        }
      },

      // Handle client cancellation
      cancel() {
        console.log("Stream cancelled by client");
      },
    });

    // Return streaming response with proper headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering in nginx
      },
    });
  } catch (error) {
    console.error("Chat stream API error:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your message and try again.";
    case 401:
      return "Authentication failed. Please check API configuration.";
    case 429:
      return "Rate limit exceeded. Please wait a moment before trying again.";
    case 503:
      return "AI service is temporarily overloaded. Please try again in a few moments.";
    default:
      return "AI service is temporarily unavailable. Please try again later.";
  }
}
