"""
Gemini AI Streaming - Python Demonstration
===========================================

This file demonstrates how streaming works in Gemini AI using Python.
The Next.js implementation follows the same principles.
"""

import os
import time
from typing import Generator, Iterator
import json

# ============================================================================
# CONCEPT 1: Non-Streaming vs Streaming
# ============================================================================

def non_streaming_response(prompt: str) -> str:
    """
    Traditional approach: Wait for complete response
    
    ❌ User Experience:
    - User sends message
    - Sees nothing for 5 seconds
    - Complete response appears
    """
    print(f"User: {prompt}")
    print("AI: <thinking...>")
    time.sleep(5)  # Simulate API processing time
    
    response = "This is a complete response that was generated all at once."
    print(f"AI: {response}")
    return response


def streaming_response(prompt: str) -> Generator[str, None, None]:
    """
    Streaming approach: Yield chunks as they're generated
    
    ✅ User Experience:
    - User sends message
    - Sees first word in 0.2 seconds
    - Response builds up word by word
    - Feels much faster!
    """
    print(f"User: {prompt}")
    print("AI: ", end='', flush=True)
    
    words = [
        "This", "is", "a", "streaming", "response", "that",
        "appears", "word", "by", "word", "in", "real-time."
    ]
    
    for word in words:
        time.sleep(0.2)  # Simulate processing each token
        print(word, end=' ', flush=True)
        yield word + ' '
    
    print()  # New line


# ============================================================================
# CONCEPT 2: Real Gemini API Streaming (with google-generativeai)
# ============================================================================

def gemini_streaming_example():
    """
    How to use streaming with actual Gemini API
    
    Installation:
        pip install google-generativeai
    
    Usage:
        export GEMINI_API_KEY="your_api_key"
        python streaming_example.py
    """
    try:
        import google.generativeai as genai
        
        # Configure API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("❌ GEMINI_API_KEY not set")
            return
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Non-streaming (traditional)
        print("\n" + "="*60)
        print("NON-STREAMING (Traditional)")
        print("="*60)
        
        response = model.generate_content("Write a haiku about Python")
        print(f"Response: {response.text}")
        print(f"Type: {type(response)}")
        
        # Streaming (modern approach)
        print("\n" + "="*60)
        print("STREAMING (Modern)")
        print("="*60)
        
        response_stream = model.generate_content(
            "Write a haiku about Python",
            stream=True  # ✅ Enable streaming
        )
        
        print("Response: ", end='', flush=True)
        full_text = ""
        
        for chunk in response_stream:
            chunk_text = chunk.text
            full_text += chunk_text
            print(chunk_text, end='', flush=True)
        
        print(f"\n\nFull text: {full_text}")
        
    except ImportError:
        print("❌ google-generativeai not installed")
        print("Install: pip install google-generativeai")


# ============================================================================
# CONCEPT 3: Server-Sent Events (SSE) Format
# ============================================================================

def simulate_sse_stream() -> Iterator[str]:
    """
    Server-Sent Events (SSE) format used in Next.js streaming
    
    Format:
        data: {json}\n\n
    
    This is what the /api/chat-stream route returns
    """
    print("\n" + "="*60)
    print("SSE FORMAT (What Next.js API returns)")
    print("="*60)
    
    chunks = [
        {"text": "Hello", "done": False},
        {"text": " world", "done": False},
        {"text": "!", "done": False},
        {"text": "[DONE]", "done": True}
    ]
    
    for chunk in chunks:
        sse_message = f"data: {json.dumps(chunk)}\n\n"
        print(sse_message, end='')
        yield sse_message
        time.sleep(0.5)


# ============================================================================
# CONCEPT 4: Client-Side Handling (JavaScript equivalent in Python)
# ============================================================================

class StreamingChatClient:
    """
    Python simulation of the useStreamingChat hook
    
    In Next.js, this is implemented as:
        /hooks/useStreamingChat.ts
    """
    
    def __init__(self):
        self.is_streaming = False
        self.streamed_content = ""
    
    def on_chunk(self, text: str):
        """Called when a chunk arrives"""
        print(f"📦 Chunk received: '{text}'")
        self.streamed_content += text
    
    def on_complete(self, full_text: str):
        """Called when streaming completes"""
        print(f"✅ Streaming complete!")
        print(f"📝 Full text: {full_text}")
    
    def on_error(self, error: str):
        """Called on error"""
        print(f"❌ Error: {error}")
    
    def send_message(self, messages: list):
        """
        Simulate sending a message with streaming
        
        In Next.js this calls:
            fetch('/api/chat-stream', ...)
        """
        self.is_streaming = True
        self.streamed_content = ""
        
        print("\n" + "="*60)
        print("CLIENT-SIDE STREAMING SIMULATION")
        print("="*60)
        
        # Simulate receiving chunks
        chunks = ["Hello", " from", " Gemini", " AI", "!"]
        
        for chunk in chunks:
            self.on_chunk(chunk)
            time.sleep(0.3)
        
        self.on_complete(self.streamed_content)
        self.is_streaming = False


# ============================================================================
# CONCEPT 5: How Next.js Streaming Works (Explained in Python)
# ============================================================================

def explain_nextjs_streaming():
    """
    How the Next.js implementation works (conceptual Python version)
    """
    print("\n" + "="*60)
    print("NEXT.JS STREAMING FLOW (Python Explanation)")
    print("="*60)
    
    # STEP 1: User sends message
    print("\n1️⃣ USER SENDS MESSAGE")
    user_message = {"role": "user", "content": "Hello!"}
    print(f"   {user_message}")
    
    # STEP 2: Create empty assistant message
    print("\n2️⃣ CREATE EMPTY ASSISTANT MESSAGE")
    assistant_message = {
        "id": "123",
        "role": "assistant",
        "content": "",  # Empty initially
        "time": "10:30 AM"
    }
    print(f"   {assistant_message}")
    
    # STEP 3: Call streaming API
    print("\n3️⃣ CALL /api/chat-stream")
    print("   fetch('/api/chat-stream', { method: 'POST', ... })")
    
    # STEP 4: Receive and process chunks
    print("\n4️⃣ RECEIVE CHUNKS IN REAL-TIME")
    chunks = ["Hello", " there", "!", " How", " can", " I", " help", "?"]
    
    for i, chunk in enumerate(chunks, 1):
        print(f"   Chunk {i}: '{chunk}'")
        assistant_message["content"] += chunk
        print(f"   UI shows: '{assistant_message['content']}'")
        time.sleep(0.3)
    
    # STEP 5: Complete
    print("\n5️⃣ STREAMING COMPLETE")
    print(f"   Final message: {assistant_message}")


# ============================================================================
# CONCEPT 6: Benefits of Streaming
# ============================================================================

def demonstrate_streaming_benefits():
    """
    Visual comparison of streaming vs non-streaming
    """
    print("\n" + "="*60)
    print("STREAMING BENEFITS")
    print("="*60)
    
    import time
    
    # Non-streaming
    print("\n❌ NON-STREAMING:")
    print("User waits... ", end='', flush=True)
    for _ in range(5):
        time.sleep(1)
        print(".", end='', flush=True)
    print(" Response appears!")
    
    # Streaming
    print("\n✅ STREAMING:")
    print("Response: ", end='', flush=True)
    words = ["This", "is", "much", "better", "UX!"]
    for word in words:
        time.sleep(0.5)
        print(word, end=' ', flush=True)
    print("\n")
    
    print("\n📊 METRICS:")
    print("   Non-streaming: Time to first content = 5s")
    print("   Streaming:     Time to first content = 0.5s")
    print("   Result:        10x faster perceived performance! 🚀")


# ============================================================================
# CONCEPT 7: Error Handling in Streaming
# ============================================================================

def streaming_with_error_handling():
    """
    How to handle errors in streaming
    """
    print("\n" + "="*60)
    print("ERROR HANDLING IN STREAMING")
    print("="*60)
    
    def stream_with_potential_error():
        chunks = ["Hello", " world"]
        
        for i, chunk in enumerate(chunks):
            if i == 1:
                # Simulate error
                raise Exception("Service overloaded")
            yield chunk
    
    try:
        print("Streaming: ", end='', flush=True)
        for chunk in stream_with_potential_error():
            print(chunk, end='', flush=True)
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print("🔄 Retrying in 3 seconds...")
        time.sleep(3)
        print("✅ Retry complete")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("="*60)
    print("GEMINI AI STREAMING - PYTHON DEMONSTRATION")
    print("="*60)
    
    # 1. Basic concept
    print("\n📚 CONCEPT 1: Non-Streaming vs Streaming")
    print("-" * 60)
    
    print("\n--- Non-Streaming Example ---")
    non_streaming_response("Hello!")
    
    print("\n--- Streaming Example ---")
    for chunk in streaming_response("Hello!"):
        pass  # Chunks are printed in the generator
    
    # 2. Client simulation
    client = StreamingChatClient()
    client.send_message([{"role": "user", "content": "Hi"}])
    
    # 3. SSE format
    for sse in simulate_sse_stream():
        pass  # SSE messages are printed in the generator
    
    # 4. Next.js flow explanation
    explain_nextjs_streaming()
    
    # 5. Benefits demonstration
    demonstrate_streaming_benefits()
    
    # 6. Error handling
    streaming_with_error_handling()
    
    # 7. Real Gemini API (if available)
    print("\n" + "="*60)
    print("REAL GEMINI API STREAMING")
    print("="*60)
    gemini_streaming_example()
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print("""
    ✅ Streaming provides better UX with real-time responses
    ✅ Next.js implementation uses ReadableStream + SSE
    ✅ Custom React hook encapsulates streaming logic
    ✅ Proper error handling and cancellation support
    ✅ TypeScript ensures type safety
    
    🚀 Your Next.js app now has production-ready streaming!
    
    Files to explore:
    - /app/api/chat-stream/route.ts (Backend streaming)
    - /hooks/useStreamingChat.ts (React hook)
    - /components/ChatWindow.tsx (UI integration)
    - /docs/STREAMING_IMPLEMENTATION.md (Full guide)
    """)

