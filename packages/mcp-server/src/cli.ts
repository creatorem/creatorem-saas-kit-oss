#!/usr/bin/env node

import { DocsClient } from './docs-client.js';
import { readServerConfig } from './env.js';
import { RpcServer } from './rpc-server.js';
import { TOOL_DEFINITIONS, callTool, createToolHandlers } from './tools.js';

const SERVER_NAME = '@creatorem/mcp-server';
const SERVER_VERSION = '0.1.0';

function printHelp() {
    process.stdout.write(`${SERVER_NAME}\n\n`);
    process.stdout.write('Creatorem MCP server exposing docs capability tools.\n\n');
    process.stdout.write('Environment variables:\n');
    process.stdout.write('- CREATOREM_MCP_BASE_URL (default: https://creatorem.com)\n');
    process.stdout.write('- CREATOREM_MCP_TIMEOUT_MS (default: 10000)\n');
    process.stdout.write('- CREATOREM_MCP_CACHE_TTL_MS (default: 60000)\n');
}

async function main() {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        printHelp();
        process.exit(0);
    }

    const config = readServerConfig(process.env);
    const docsClient = new DocsClient(config);
    const toolHandlers = createToolHandlers(docsClient);

    const rpcServer = new RpcServer({
        serverName: SERVER_NAME,
        serverVersion: SERVER_VERSION,
        tools: TOOL_DEFINITIONS,
        callTool: (name, args) => callTool(toolHandlers, name, args),
    });

    rpcServer.start();
}

void main().catch((error) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`[mcp-server] fatal startup error: ${message}\n`);
    process.exit(1);
});
