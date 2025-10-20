import { NextResponse } from "next/server";
import { callAssistant, AssistantResponse } from "@/lib/assistant"; // Import the necessary types and function

// Define the interface for the request body
interface AssistantRequestBody {
  prompt: string;
  model?: string;
}

// Define the expected successful API response structure
interface SuccessResponse {
    ok: true;
    data: { text: string };
    source: string;
}

// Define the expected error API response structure
interface ErrorResponse {
    ok: false;
    error: string;
    data: { text: string }; // Includes the friendly fallback message
}

export async function POST(req: Request) {
  try {
    const body: AssistantRequestBody = await req.json();
    
    if (!body || typeof body.prompt !== 'string' || body.prompt.trim() === '') {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 });
    }

    // Call the core logic function
    const result: AssistantResponse = await callAssistant({ 
      prompt: body.prompt, 
      model: body.model 
    });

    // Check if the result from callAssistant included an error from the API
    if (result.error) {
        // This handles the "local_fallback" case from the assistant.ts file, 
        // which still provides a text response. We return status 500 but with a friendly message.
        const responseBody: ErrorResponse = { 
            ok: false, 
            error: result.error, 
            data: { text: result.text } 
        };
        return NextResponse.json(responseBody, { status: 500 });
    }

    // Success response
    const responseBody: SuccessResponse = { 
      ok: true, 
      data: { text: result.text },
      source: result.source || 'unknown'
    };
    return NextResponse.json(responseBody);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    
    console.error("Assistant API error:", errorMessage);
    
    // Generic server failure (e.g., JSON parsing failed, or an issue *before* callAssistant was run)
    const responseBody: ErrorResponse = { 
        ok: false, 
        error: errorMessage,
        data: { 
            text: "I'm experiencing high server load. Could you please rephrase your question about crop health, diseases, or farming practices?" 
        } 
    };
    return NextResponse.json(responseBody, { status: 500 });
  }
}