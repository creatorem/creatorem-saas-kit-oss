import { createOpenAI, openai } from '@ai-sdk/openai';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { logger } from '@kit/utils';
import { convertToModelMessages, streamText } from 'ai';
import { aiConfig } from '~/config/ai.config';
import { billingConfig } from '~/config/billing.config';
import { getAllTools } from '~/lib/ai-backend-tools';
import { getAppUrl } from '~/lib/get-app-url';
import { getRecordAiUsageHandlers } from '@kit/ai/server/get-record-ai-usage-handlers'
import { serverTrpc } from '~/trpc/server-client';
import { envs } from '~/envs';

const groq = createOpenAI({
    apiKey: envs().GROQ_API_KEY ?? '',
    baseURL: 'https://api.groq.com/openai/v1',
});

export const maxDuration = 30;

/**
 * Maps model names to their corresponding AI SDK model instances
 * @param modelName - The name of the model to use
 * @returns The configured model instance
 */
const getAiModel = (modelName?: string) => {
    switch (modelName) {
        case 'llama-3.1-8b-instant':
            return groq('llama-3.1-8b-instant'); // 3.5/5
        case 'llama-3.3-70b-versatile':
            return groq('llama-3.3-70b-versatile'); // 3.5/5
        case 'openai/gpt-oss-20b':
            return groq('openai/gpt-oss-20b');
        case 'openai/gpt-oss-120b':
            return groq('openai/gpt-oss-120b');
        case 'qwen/qwen3-32b':
            return groq('qwen/qwen3-32b'); // 3.5/5
        case 'gpt-5-nano':
            return openai('gpt-5-nano'); // 5/5
        default:
            throw new Error(`Unknown model name: ${modelName}`);
    }
};

export async function POST(req: Request) {
    try {
        const {
            messages,
            tools: frontTools,
            disabledTools,
            selectedModel,
            ...body
        } = (await req.json()) as unknown as {
            messages: Parameters<typeof convertToModelMessages>[0];
            threadId?: string;
            title?: string;
            metadata?: Record<string, unknown>;
            tools: Parameters<typeof frontendTools>[0];
            disabledTools: string[];
            selectedModel?: string;
        };

        const handlers = await getRecordAiUsageHandlers({
            aiConfig,
            billingConfig,
            body,
            serverTrpc: serverTrpc,
        });

        if (handlers instanceof Response) {
            return handlers;
        }

        const { effectiveThreadId, onStreamTextFinish } = handlers;

        const serverTools = getAllTools({ getUrl: getAppUrl });
        const filteredServerTools = Object.fromEntries(
            Object.entries(serverTools).filter(([toolName]) => !disabledTools.includes(toolName)),
        );

        const result = streamText({
            model: getAiModel(selectedModel),
            messages: convertToModelMessages(messages),
            tools: { ...frontendTools(frontTools), ...filteredServerTools },
            onFinish: onStreamTextFinish,
        });

        return result.toUIMessageStreamResponse({
            headers: {
                'x-thread-id': effectiveThreadId,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Chat route error');
        return new Response(JSON.stringify({ error: 'Internal error' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
