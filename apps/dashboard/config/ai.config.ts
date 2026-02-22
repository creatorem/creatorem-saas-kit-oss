import { parseAiConfig } from '@kit/ai/config';

/**
 * AI Configuration
 *
 * This config defines the global context for AI interactions and pricing per model.
 * Pricing is defined per 1M tokens in USD (currency from billing config).
 *
 * Update the pricing based on your AI provider's pricing:
 * - Groq: https://groq.com/pricing/
 * - OpenAI: https://openai.com/pricing/
 *
 * Included amounts per subscription support two formats:
 * 1. Simple number (applies to all intervals): productId: 9
 * 2. Interval-specific amounts: productId: { month: 9, year: 90 }
 */
export const aiConfig = parseAiConfig({
    /**
     * Global context that will be included in all AI requests
     */
    globalContext: `You are a helpful AI assistant integrated into the Acme platform.
You help users with their tasks, answer questions, and provide guidance.
Be concise, accurate, and professional in your responses.`,

    /**
     * Available models that users can select from
     */
    availableModels: [
        {
            id: 'llama-3.1-8b-instant',
            name: 'Llama 3.1 8B (Fast)',
        },
        {
            id: 'llama-3.3-70b-versatile',
            name: 'Llama 3.3 70B (Versatile)',
        },
        {
            id: 'qwen/qwen3-32b',
            name: 'Qwen 3 32B',
        },
        {
            id: 'openai/gpt-oss-20b',
            name: 'GPT OSS 20B',
        },
        {
            id: 'openai/gpt-oss-120b',
            name: 'GPT OSS 120B',
        },
        {
            id: 'gpt-5-nano',
            name: 'GPT-5 Nano',
        },
    ],

    /**
     * Default model to use when multiple models are available
     * Should match one of the model IDs in availableModels
     */
    defaultModel: 'llama-3.1-8b-instant',

    /**
     * Pricing configuration per model ID
     * All prices are per 1M tokens in USD
     */
    pricing: {
        // Groq Models
        'llama-3.1-8b-instant': {
            inputTokens: 1.5, // $0.05 / 1M input tokens
            outputTokens: 2.8, // $0.08 / 1M output tokens
            reasoningTokens: 0,
            cachedInputTokens: 0.25,
        },
        'llama-3.3-70b-versatile': {
            inputTokens: 2.59, // $0.59 / 1M input tokens
            outputTokens: 3.79, // $0.79 / 1M output tokens
            reasoningTokens: 0,
            cachedInputTokens: 0.295,
        },
        'qwen/qwen3-32b': {
            inputTokens: 1.1, // $0.10 / 1M input tokens
            outputTokens: 2.1, // $0.10 / 1M output tokens
            reasoningTokens: 0,
            cachedInputTokens: 0.05,
        },
        'openai/gpt-oss-20b': {
            inputTokens: 2.15, // $0.15 / 1M input tokens
            outputTokens: 5.15, // $0.15 / 1M output tokens
            reasoningTokens: 0,
            cachedInputTokens: 0.075,
        },
        'openai/gpt-oss-120b': {
            inputTokens: 1.3, // $0.30 / 1M input tokens
            outputTokens: 3.3, // $0.30 / 1M output tokens
            reasoningTokens: 0,
            cachedInputTokens: 0.15,
        },
        'gpt-5-nano': {
            inputTokens: 1.2, // $0.20 / 1M input tokens
            outputTokens: 3.4, // $0.40 / 1M output tokens
            reasoningTokens: 0,
            cachedInputTokens: 0.1,
        },
    },

    includedAmountPerSubscription: {
        prod_SnZo9gjf64pu8V: { month: 9, year: 90 },
        prod_SoMQHe5KvYYTXd: { month: 20, year: 200 },
        prod_SoMReYpTHqroXz: { month: 50, year: 500 },
    },
});
