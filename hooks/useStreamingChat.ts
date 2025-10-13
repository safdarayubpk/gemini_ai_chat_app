import { useState, useCallback, useRef } from "react";

/**
 * Custom Hook for Streaming Chat with Gemini AI
 *
 * Best Practices:
 * - Encapsulates streaming logic in a reusable hook
 * - Manages AbortController for request cancellation
 * - Provides clean API with callbacks
 * - Handles errors gracefully
 * - TypeScript for type safety
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseStreamingChatOptions {
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

interface StreamResponse {
  text?: string;
  done?: boolean;
  error?: boolean;
  message?: string;
  code?: number;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(
    async (messages: Message[]) => {
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsStreaming(true);
      setStreamedContent("");

      try {
        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response body is available
        if (!response.body) {
          throw new Error("Response body is null");
        }

        // Read the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE format (data: {json}\n\n)
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6); // Remove "data: " prefix

              if (data.trim() === "[DONE]") {
                // Stream completed
                if (options.onComplete) {
                  options.onComplete(fullText);
                }
                continue;
              }

              try {
                const parsed: StreamResponse = JSON.parse(data);

                // Handle error
                if (parsed.error) {
                  const errorMessage =
                    parsed.message || "Stream error occurred";
                  if (options.onError) {
                    options.onError(errorMessage);
                  }
                  throw new Error(errorMessage);
                }

                // Handle text chunk
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamedContent(fullText);

                  // Call chunk callback
                  if (options.onChunk) {
                    options.onChunk(parsed.text);
                  }
                }
              } catch (parseError) {
                if (
                  parseError instanceof Error &&
                  parseError.message.includes("error occurred")
                ) {
                  throw parseError;
                }
                // Ignore JSON parse errors for invalid chunks
                console.warn("Failed to parse SSE chunk:", parseError);
              }
            }
          }
        }

        return fullText;
      } catch (error) {
        // Don't handle AbortError as an actual error
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Stream cancelled");
          return "";
        }

        const errorMessage =
          error instanceof Error ? error.message : "Failed to stream response";

        if (options.onError) {
          options.onError(errorMessage);
        }

        throw error;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  /**
   * Cancel the current streaming request
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  /**
   * Reset the streamed content
   */
  const resetStream = useCallback(() => {
    setStreamedContent("");
  }, []);

  return {
    sendMessage,
    cancelStream,
    resetStream,
    isStreaming,
    streamedContent,
  };
}
