import type { AIProvider } from '../../../../types/ai.types.js';
import { GeminiProvider } from './gemini.js';

const providers = new Map<string, AIProvider>();

providers.set('gemini', new GeminiProvider());

export const ProviderRegistry = {
  get(name: string = 'gemini'): AIProvider {
    const provider = providers.get(name);
    if (!provider) throw new Error(`AI provider "${name}" not found`);
    return provider;
  },

  getDefault(): AIProvider {
    return providers.get('gemini')!;
  },

  register(name: string, provider: AIProvider): void {
    providers.set(name, provider);
  },
};
