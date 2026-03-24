import type { ToolDefinition, ToolResult } from './types.js';

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
    jsonrpc: '2.0';
    id?: JsonRpcId;
    method: string;
    params?: unknown;
};

type JsonRpcErrorResponse = {
    jsonrpc: '2.0';
    id: JsonRpcId;
    error: {
        code: number;
        message: string;
        data?: unknown;
    };
};

type JsonRpcSuccessResponse = {
    jsonrpc: '2.0';
    id: JsonRpcId;
    result: unknown;
};

type ServerOptions = {
    serverName: string;
    serverVersion: string;
    tools: ToolDefinition[];
    callTool: (name: string, args: unknown) => Promise<ToolResult>;
    defaultProtocolVersion?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export class RpcServer {
    readonly #serverName: string;
    readonly #serverVersion: string;
    readonly #tools: ToolDefinition[];
    readonly #callTool: (name: string, args: unknown) => Promise<ToolResult>;
    readonly #defaultProtocolVersion: string;

    #buffer = Buffer.alloc(0);
    #started = false;

    constructor(options: ServerOptions) {
        this.#serverName = options.serverName;
        this.#serverVersion = options.serverVersion;
        this.#tools = options.tools;
        this.#callTool = options.callTool;
        this.#defaultProtocolVersion = options.defaultProtocolVersion ?? '2025-03-26';
    }

    start() {
        if (this.#started) {
            return;
        }

        this.#started = true;
        process.stdin.on('data', (chunk) => {
            this.#onData(chunk);
        });
        process.stdin.on('error', (error) => {
            this.#log(`stdin error: ${error instanceof Error ? error.message : String(error)}`);
        });

        process.stdin.resume();
    }

    #onData(chunk: Buffer | string) {
        const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        this.#buffer = Buffer.concat([this.#buffer, data]);

        while (true) {
            const headerEnd = this.#buffer.indexOf('\r\n\r\n');
            if (headerEnd === -1) {
                return;
            }

            const headerBlock = this.#buffer.subarray(0, headerEnd).toString('utf8');
            const contentLength = this.#readContentLength(headerBlock);
            if (contentLength === null) {
                this.#log(`invalid message headers: ${headerBlock}`);
                this.#buffer = this.#buffer.subarray(headerEnd + 4);
                continue;
            }

            const bodyStart = headerEnd + 4;
            const bodyEnd = bodyStart + contentLength;
            if (this.#buffer.length < bodyEnd) {
                return;
            }

            const body = this.#buffer.subarray(bodyStart, bodyEnd).toString('utf8');
            this.#buffer = this.#buffer.subarray(bodyEnd);

            let parsed: unknown;
            try {
                parsed = JSON.parse(body);
            } catch {
                this.#sendError(null, -32700, 'Parse error');
                continue;
            }

            void this.#handleMessage(parsed);
        }
    }

    #readContentLength(headers: string) {
        const lines = headers.split('\r\n');
        for (const line of lines) {
            const match = /^content-length\s*:\s*(\d+)$/i.exec(line.trim());
            if (!match || !match[1]) {
                continue;
            }

            const parsed = Number.parseInt(match[1], 10);
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    }

    async #handleMessage(raw: unknown) {
        if (!isRecord(raw) || raw.jsonrpc !== '2.0' || typeof raw.method !== 'string') {
            this.#sendError(null, -32600, 'Invalid Request');
            return;
        }

        const request = raw as JsonRpcRequest;
        const id = request.id ?? null;
        const isNotification = request.id === undefined;

        switch (request.method) {
            case 'initialize': {
                if (isNotification) {
                    return;
                }

                const protocolVersion = this.#extractProtocolVersion(request.params);
                this.#sendResult(id, {
                    protocolVersion,
                    capabilities: {
                        tools: {
                            listChanged: false,
                        },
                    },
                    serverInfo: {
                        name: this.#serverName,
                        version: this.#serverVersion,
                    },
                });
                return;
            }

            case 'notifications/initialized':
                return;

            case 'tools/list': {
                if (isNotification) {
                    return;
                }

                this.#sendResult(id, {
                    tools: this.#tools,
                });
                return;
            }

            case 'tools/call': {
                if (isNotification) {
                    return;
                }

                if (!isRecord(request.params)) {
                    this.#sendError(id, -32602, 'Invalid params: expected object');
                    return;
                }

                const name = request.params.name;
                const args = request.params.arguments;

                if (typeof name !== 'string' || name.trim().length === 0) {
                    this.#sendError(id, -32602, 'Invalid params: "name" must be a non-empty string');
                    return;
                }

                const result = await this.#callTool(name, args);
                this.#sendResult(id, result);
                return;
            }

            case 'ping': {
                if (isNotification) {
                    return;
                }

                this.#sendResult(id, {});
                return;
            }

            case 'shutdown': {
                if (isNotification) {
                    return;
                }

                this.#sendResult(id, {});
                return;
            }

            default:
                if (!isNotification) {
                    this.#sendError(id, -32601, `Method not found: ${request.method}`);
                }
        }
    }

    #extractProtocolVersion(params: unknown) {
        if (isRecord(params) && typeof params.protocolVersion === 'string') {
            return params.protocolVersion;
        }

        return this.#defaultProtocolVersion;
    }

    #sendResult(id: JsonRpcId, result: unknown) {
        const payload: JsonRpcSuccessResponse = {
            jsonrpc: '2.0',
            id,
            result,
        };

        this.#write(payload);
    }

    #sendError(id: JsonRpcId, code: number, message: string, data?: unknown) {
        const payload: JsonRpcErrorResponse = {
            jsonrpc: '2.0',
            id,
            error: {
                code,
                message,
                ...(data === undefined ? {} : { data }),
            },
        };

        this.#write(payload);
    }

    #write(payload: JsonRpcSuccessResponse | JsonRpcErrorResponse) {
        const body = JSON.stringify(payload);
        const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
        process.stdout.write(header + body);
    }

    #log(message: string) {
        process.stderr.write(`[mcp-server] ${message}\n`);
    }
}
