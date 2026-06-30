# Campus Bazzar Documentation

This directory contains all technical and operational documentation for the Campus Bazzar project.

## Quick Links

- **[Development Guide](./DEVELOPMENT.md)** — Setup, workflow, and local development
- **[Architecture](./ARCHITECTURE.md)** — System design, patterns, and component relationships
- **[API Documentation](./API.md)** — Endpoint specifications and integration guides
- **[Deployment](./DEPLOYMENT.md)** — Release procedures and environment configuration
- **[Testing](./TESTING.md)** — Test strategies and coverage expectations
- **[Operations](./OPERATIONS.md)** — Monitoring, logging, and incident response

## Project Structure

```
Campus_Bazzar/
├── backend/              # Node.js backend service
├── frontend/             # React frontend application
├── docs/                 # This documentation
├── tickets/              # Issue tracking and work items
└── .claude/              # Claude Code workspace configuration
```

## Standards

- Follow [CLAUDE.md](../.claude/CLAUDE.md) for coding philosophy and workflow
- Use templates in `tickets/` for creating new work items
- Update documentation when behavior or workflow changes
- Keep all documentation concise and aligned with the implementation

## Contributing

1. Create issues in `tickets/` using the appropriate template
2. Document changes as part of your work
3. Link related issues and PRs in tickets
