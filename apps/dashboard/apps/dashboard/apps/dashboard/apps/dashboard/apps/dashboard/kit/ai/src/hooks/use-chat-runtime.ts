'use client';

import { type UIMessage, useChat } from '@ai-sdk/react';
import {
    AssistantRuntime,
    unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
    WebSpeechSynthesisAdapter,
} from '@assistant-ui/react';
import { AssistantChatTransport, useAISDKRuntime } from '@assistant-ui/react-ai-sdk';
import { type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { ChatInit } from 'ai';
import { aiRouter } from '../router/router';
import { useDBThreadAdapter } from './use-db-thread-adapter';

type UseChatRuntimeOptions<UI_MESSAGE extends UIMessage = UIMessage> = ChatInit<UI_MESSAGE> & {
    adapters?: NonNullable<Parameters<typeof useAISDKRuntime>[1]>['adapters'] | undefined;
    clientTrpc: TrpcClientWithQuery<typeof aiRouter>;
};

const useChatThreadRuntime = <UI_MESSAGE extends UIMessage = UIMessage>(
    options?: UseChatRuntimeOptions<UI_MESSAGE>,
): AssistantRuntime => {
    const { adapters, transport: transportOptions, ...chatOptions } = options ?? {};
    const transport = transportOptions ?? new AssistantChatTransport();

    // @ts-expect-error
    const chat = useChat<UI_MESSAGE>({
        ...chatOptions,
        transport,
    });

    const runtime = useAISDKRuntime(chat, {
        adapters,
    });

    if (transport instanceof AssistantChatTransport) {
        transport.setRuntime(runtime);
    }

    return runtime;
};

export const useChatRuntime = <UI_MESSAGE extends UIMessage = UIMessage>({
    clientTrpc,
    ...options
}: UseChatRuntimeOptions<UI_MESSAGE>) => {
    const dbThreadAdapter = useDBThreadAdapter(clientTrpc);

    return useRemoteThreadListRuntime({
        runtimeHook: () =>
            useChatThreadRuntime<UI_MESSAGE>({
                clientTrpc,
                ...options,
                adapters: {
                    ...options.adapters,
                    speech: new WebSpeechSynthesisAdapter(),
                },
            }),
        adapter: dbThreadAdapter,
    });
};
