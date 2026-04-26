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
 * Uses gemini-3-flash-preview for high-integrity architectural thinking.
 */
export async function generateAgentResponse(
  _agentName: string,
  userPrompt: string,
  onChunk: (text: string) => void
) {
  const model = 'gemini-3-flash-preview';
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
      },
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error(`Error generating response for ${_agentName}:`, error);
    throw error;
  }
}
