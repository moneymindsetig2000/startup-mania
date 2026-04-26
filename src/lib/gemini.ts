import { GoogleGenAI } from '@google/genai';
import { GEMINI_SYSTEM_ROLE } from './systemRole';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Thinking Levels
const MINIMAL_THINKING = 'MINIMAL';
const HIGH_THINKING = 'HIGH';

/**
 * Enhances a user prompt for UI design.
 * Uses gemini-3.1-flash-lite-preview for speed and efficiency.
 */
export async function streamEnhancedPrompt(
  input: string, 
  onChunk: (text: string) => void
) {
  const model = 'gemini-3.1-flash-lite-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Generate an enhanced version of this prompt (reply with only the enhanced prompt - no conversation, explanations, lead-in, bullet points, placeholders, or surrounding quotes):

${input}`,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config: {
        thinkingConfig: {
          thinkingLevel: MINIMAL_THINKING as any,
        },
      },
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    throw error;
  }
}

/**
 * Generates a full UI design response from a specific agent.
 * Uses gemma-4-31b-it for high-integrity architectural thinking.
 */
export async function generateAgentResponse(
  _agentName: string,
  userPrompt: string,
  onChunk: (text: string) => void
) {
  const model = 'gemma-4-31b-it';
  const tools = [
    {
      googleSearch: {
      }
    },
  ];
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: userPrompt,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config: {
        systemInstruction: GEMINI_SYSTEM_ROLE,
        thinkingConfig: {
          thinkingLevel: HIGH_THINKING as any,
        },
        tools,
        maxOutputTokens: 32000,
      },
      contents,
    });

    for await (const chunk of response) {
      // Extract thinking and text from the response parts
      const parts = (chunk as any).candidates?.[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          if (part.thought && part.text) {
            // This is a thinking/reasoning part
            onChunk(`<thought>${part.text}</thought>`);
          } else if (part.text && !part.thought) {
            // This is a regular text part
            onChunk(part.text);
          }
        }
      } else if (chunk.text) {
        // Fallback for models that don't use parts structure
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error(`Error generating response for ${_agentName}:`, error);
    throw error;
  }
}

