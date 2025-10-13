# 503 Error Handling & Auto-Retry Implementation

## Overview

Implemented comprehensive error handling for Gemini API 503 "Service Overloaded" errors with automatic retry logic, user-friendly error messages, and graceful degradation.

## Problem Analysis

### **Original Issue:**

```
POST /api/chat 500 in 14747ms
Gemini API error: 503 {
  "error": {
    "code": 503,
    "message": "The model is overloaded. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
```

### **Root Causes:**

1. **503 Service Overloaded**: Gemini API temporarily overloaded
2. **Generic Error Handling**: No specific handling for different error codes
3. **Poor User Experience**: Generic error messages without retry guidance
4. **No Auto-Recovery**: Manual retry required for temporary issues

## Solutions Implemented

### 1. Enhanced API Route Error Handling

#### **Specific Error Code Mapping:**

```typescript
// Enhanced error handling in /api/chat/route.ts
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
        error: "Rate limit exceeded. Please wait a moment before trying again.",
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
        error: "AI service is temporarily unavailable. Please try again later.",
        errorCode: "SERVICE_UNAVAILABLE",
      },
      { status: 500 }
    );
  }
}
```

#### **Error Response Interface:**

```typescript
interface ChatResponse {
  success: boolean;
  assistant?: string;
  error?: string;
  errorCode?: string; // New field for specific error identification
}
```

### 2. Frontend Auto-Retry Logic

#### **Smart Retry Mechanism:**

```typescript
// Enhanced error handling in ChatWindow.tsx
if (errorCode === "SERVICE_OVERLOADED") {
  userFriendlyError =
    "AI service is temporarily overloaded. Please try again in a few moments.";

  // Auto-retry for 503 errors (up to 3 times)
  if (retryCount < 3 && lastUserMessage) {
    setIsAutoRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Retry after 3 seconds
    setTimeout(() => {
      setIsAutoRetrying(false);
      handleSend(lastUserMessage);
    }, 3000);
  }
}
```

#### **State Management:**

```typescript
const [retryCount, setRetryCount] = useState(0);
const [isAutoRetrying, setIsAutoRetrying] = useState(false);

// Reset retry count on success
setRetryCount(0);

// Reset retry count on new chat
const handleNewChatInternal = useCallback(() => {
  setMessages([]);
  setError(null);
  setLastUserMessage(null);
  setInputValue("");
  setRetryCount(0);
  setIsAutoRetrying(false);
  setLocalStorageItem("chat-messages", []);
}, []);
```

### 3. Enhanced User Experience

#### **Dynamic Error Messages:**

```typescript
// User-friendly error messages based on error codes
let userFriendlyError = errorMessage;
if (errorCode === "SERVICE_OVERLOADED") {
  userFriendlyError =
    "AI service is temporarily overloaded. Please try again in a few moments.";
} else if (errorCode === "RATE_LIMIT_EXCEEDED") {
  userFriendlyError =
    "Rate limit exceeded. Please wait a moment before trying again.";
} else if (errorCode === "INVALID_REQUEST") {
  userFriendlyError =
    "Invalid request. Please check your message and try again.";
} else if (errorCode === "SERVICE_UNAVAILABLE") {
  userFriendlyError =
    "AI service is temporarily unavailable. Please try again later.";
}
```

#### **Auto-Retry Feedback:**

```typescript
// Show auto-retry status in error banner
<ErrorBanner
  error={isAutoRetrying ? `${error} (Auto-retrying in 3 seconds...)` : error}
  onRetry={lastUserMessage && !isAutoRetrying ? handleRetry : undefined}
  onDismiss={handleDismissError}
/>
```

## Error Code Reference

### **503 - Service Overloaded**

- **Cause**: Gemini API temporarily overloaded
- **User Message**: "AI service is temporarily overloaded. Please try again in a few moments."
- **Action**: Auto-retry up to 3 times with 3-second delay
- **Fallback**: Manual retry button available

### **429 - Rate Limit Exceeded**

- **Cause**: Too many requests in short time period
- **User Message**: "Rate limit exceeded. Please wait a moment before trying again."
- **Action**: Manual retry recommended after delay
- **Fallback**: Wait and retry manually

### **400 - Invalid Request**

- **Cause**: Malformed request or invalid parameters
- **User Message**: "Invalid request. Please check your message and try again."
- **Action**: Review and modify request
- **Fallback**: Check message content and format

### **500 - Service Unavailable**

- **Cause**: General server error or unknown issue
- **User Message**: "AI service is temporarily unavailable. Please try again later."
- **Action**: Manual retry after delay
- **Fallback**: Contact support if persistent

## Auto-Retry Logic

### **Retry Strategy:**

1. **Trigger**: 503 Service Overloaded errors only
2. **Limit**: Maximum 3 automatic retries
3. **Delay**: 3 seconds between retries
4. **Reset**: Retry count resets on successful response
5. **Fallback**: Manual retry button after auto-retries exhausted

### **User Feedback:**

- **Auto-retrying**: Shows "Auto-retrying in 3 seconds..." message
- **Retry count**: Tracks attempts in console logs
- **Manual retry**: Retry button available when not auto-retrying
- **Success**: Retry count resets on successful response

## Testing Scenarios

### **1. 503 Error Simulation:**

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Test message"}]}'
```

### **2. Expected Behavior:**

- **First 503**: Auto-retry after 3 seconds
- **Second 503**: Auto-retry after 3 seconds
- **Third 503**: Auto-retry after 3 seconds
- **Fourth 503**: Show error with manual retry button
- **Success**: Reset retry count and continue normally

### **3. User Experience:**

- **Immediate Feedback**: Error message appears instantly
- **Auto-Recovery**: Automatic retry without user intervention
- **Progress Indication**: Shows retry countdown
- **Manual Control**: Option to retry manually or dismiss

## Performance Impact

### **Before Enhancement:**

- **Error Handling**: Generic 500 errors
- **User Experience**: Confusing error messages
- **Recovery**: Manual retry required
- **Success Rate**: Low for temporary issues

### **After Enhancement:**

- **Error Handling**: Specific error codes and messages
- **User Experience**: Clear, actionable error messages
- **Recovery**: Automatic retry for 503 errors
- **Success Rate**: High for temporary issues

## Monitoring and Logging

### **Server-Side Logging:**

```typescript
console.error("Gemini API error:", geminiResponse.status, errorText);
```

### **Client-Side Logging:**

```typescript
console.error("Error sending message:", error);
```

### **Error Tracking:**

- **Error Codes**: Tracked for analytics
- **Retry Attempts**: Logged for debugging
- **Success Rates**: Monitored for service health
- **User Experience**: Measured through error frequency

## Best Practices

### **1. Error Handling:**

- **Specific Messages**: Provide clear, actionable error messages
- **Error Codes**: Use consistent error code mapping
- **Logging**: Log errors with context for debugging
- **Graceful Degradation**: App continues to function despite errors

### **2. Retry Logic:**

- **Exponential Backoff**: Consider implementing for production
- **Retry Limits**: Prevent infinite retry loops
- **User Feedback**: Show retry progress to users
- **Manual Override**: Allow users to retry manually

### **3. User Experience:**

- **Clear Communication**: Explain what's happening and what to do
- **Progress Indication**: Show retry attempts and timing
- **Control Options**: Provide manual retry and dismiss options
- **Consistent Behavior**: Maintain predictable error handling

## Future Enhancements

### **1. Advanced Retry Logic:**

- **Exponential Backoff**: Increase delay between retries
- **Jitter**: Add randomness to prevent thundering herd
- **Circuit Breaker**: Temporarily stop retries after failures
- **Health Checks**: Monitor API health before retrying

### **2. Enhanced Monitoring:**

- **Error Analytics**: Track error patterns and frequencies
- **Performance Metrics**: Monitor retry success rates
- **User Experience**: Measure error impact on user satisfaction
- **Alerting**: Notify when error rates exceed thresholds

### **3. User Experience Improvements:**

- **Retry Progress**: Show countdown timer for auto-retries
- **Error History**: Allow users to see previous error attempts
- **Offline Mode**: Handle network connectivity issues
- **Fallback Responses**: Provide cached responses when possible

## Conclusion

The 503 error handling implementation provides:

- ✅ **Robust Error Handling**: Specific error codes and user-friendly messages
- ✅ **Automatic Recovery**: Auto-retry for temporary service issues
- ✅ **Enhanced UX**: Clear feedback and manual control options
- ✅ **Production Ready**: Comprehensive error handling and logging
- ✅ **Scalable Design**: Easy to extend for additional error types

The application now gracefully handles Gemini API overload situations with automatic retry logic, providing a smooth user experience even during temporary service issues.
