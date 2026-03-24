# @creatorem/mcp-server

Installable MCP server exposing Creatorem documentation capabilities for coding agents.

## Run

```bash
npx @creatorem/mcp-server
```

Or in this monorepo:

```bash
pnpm --filter @creatorem/mcp-server build
pnpm --filter @creatorem/mcp-server start
```

## Environment Variables

- `CREATOREM_MCP_BASE_URL`: Base URL for docs endpoints (default: `https://creatorem.com`)
- `CREATOREM_MCP_TIMEOUT_MS`: Upstream HTTP timeout in ms (default: `10000`)
- `CREATOREM_MCP_CACHE_TTL_MS`: In-memory cache TTL in ms (default: `60000`)

## Tools

- `creatorem.list_capabilities`
- `creatorem.get_capability`
- `creatorem.get_page_content`
- `creatorem.search_capabilities`
