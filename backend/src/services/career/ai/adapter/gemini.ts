import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { env } from '../../../../config/env.js';
import type { AIProvider, AIResponse, PromptModule, PromptContext } from '../../../../types/ai.types.js';

export class GeminiProvider implements AIProvider {
  private model: GenerativeModel;

  constructor(apiKey?: string) {
    const key = apiKey || env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured');
    const genAI = new GoogleGenerativeAI(key);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generate<T>(prompt: PromptModule<T>, ctx: PromptContext): Promise<AIResponse<T>> {
    const systemText = prompt.system(ctx);
    const userText = prompt.user(ctx);
    const startTime = Date.now();

    const result = await this.model.generateContent({
      systemInstruction: { role: 'user', parts: [{ text: systemText }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: prompt.temperature,
      },
    });

    const latencyMs = Date.now() - startTime;
    const raw = result.response.text();
    const usage = result.response.usageMetadata;

    const parsed = JSON.parse(raw);
    const data = prompt.schema.parse(parsed);

    return {
      data,
      raw,
      latencyMs,
      tokens: usage?.totalTokenCount,
    };
  }
}
