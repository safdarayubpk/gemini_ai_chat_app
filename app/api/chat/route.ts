import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Basic validation - ensure we have a message field
    if (!body || typeof body.message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Expected { message: string }' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Gemini API
    // The Gemini API key will be available at process.env.GEMINI_API_KEY (server-only)
    // We'll add the actual Gemini API call in the next implementation step
    
    // For now, return a test response
    return NextResponse.json(
      { success: true, message: 'ok' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
