# VEX Memory And Indexing Setup

Serena is installed via uv at C:\Users\jonat\.local\bin\serena and configured in Codex as MCP server serena with command:
serena start-mcp-server --context=codex --project-from-cwd

Serena project exists at .serena/project.yml and TypeScript LSP index was built for 4,006 files.

codebase-memory-mcp is also indexed as project C-Users-jonat-CascadeProjects-vex-app-old with 32,360 nodes and 64,859 edges, and artifact .codebase-memory/graph.db.zst exists.

agentmemory has VEX long-term memories for stack, architecture, banned patterns, source-of-truth docs, verification, and Phase 1 Supabase/RLS status.

Future sessions should use Serena/codebase-memory for symbol/code discovery before broad file search, and agentmemory for prior decisions. Repo files override memory if there is disagreement.
