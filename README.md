# Express TypeScript Clean Architecture

A Node.js Express TypeScript server with clean architecture and dependency injection.

## Project Structure

The project follows a modular clean architecture with the following structure:

```
├── src
│   ├── cmd                 # Application entry points
│   ├── api                 # API layer (HTTP handlers and routes)
│   ├── logic               # Business logic layer
│   │   ├── builder         # DTO builders
│   │   ├── domain          # Domain models and interfaces
│   │   └── manager         # Business logic managers
│   ├── store               # Data storage layer
│   │   └── pgstore         # PostgreSQL implementation
│   ├── services            # External services integrations
│   └── utils               # Utility functions and helpers
```

## Features

- Clean architecture with separation of concerns
- TypeScript for strong typing
- Dependency injection for testability
- Raw SQL queries for PostgreSQL
- Express.js for HTTP server
- Pino for logging
- Environment configuration with dotenv
- Error handling middleware

## Dependencies

- Node.js 22+
- PostgreSQL

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Configure environment variables in a `.env` file:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yourdb
DB_USER=postgres
DB_PASSWORD=postgres
LOG_LEVEL=info
```

4. Start development server: `pnpm run dev`

## Scripts

- `pnpm run build` - Build the project
- `pnpm run start` - Start the production server
- `pnpm run dev` - Start the development server
- `pnpm run lint` - Run linting
- `pnpm run test` - Run tests
