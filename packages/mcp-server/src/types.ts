export type JsonObject = Record<string, unknown>;

export type McpCapability = {
    id: string;
    title: string;
    description?: string;
    pageUrl: string;
    llmUrl: string;
    sourcePath: string;
    relatedPageUrls: string[];
    entrypoints: string[];
    inputs: string[];
    outputs: string[];
    constraints: string[];
    sideEffects: string[];
    aliases?: string[];
    tags?: string[];
    status?: string;
};

export type McpPage = {
    title: string;
    description?: string;
    pageUrl: string;
    llmUrl: string;
    sourcePath: string;
    capability: string;
};

export type McpIndex = {
    version: number;
    generatedAt: string;
    scope: string[];
    capabilities: McpCapability[];
    pages: McpPage[];
};

export type McpTextContent = {
    type: 'text';
    text: string;
};

export type ToolResult = {
    content: McpTextContent[];
    structuredContent?: JsonObject;
    isError?: boolean;
};

export type ToolDefinition = {
    name: string;
    description: string;
    inputSchema: JsonObject;
};

export type ServerConfig = {
    baseUrl: string;
    timeoutMs: number;
    cacheTtlMs: number;
};
