# Finlens Backend API

Vietnamese Stock Market Analysis Backend API built with Node.js, Express, and TypeScript.

## Features

- RESTful API with Express
- TypeScript for type safety
- ESLint and Prettier for code quality
- Nodemon for development hot-reload
- Environment-based configuration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Run in development mode
npm run dev
```

The server will start on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## API Endpoints

### Health Check
```
GET /health
```

Returns server health status and uptime information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T03:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "service": "Finlens Stock Market Analysis API"
}
```

## Project Structure

```
backend/
├── src/
│   └── index.ts          # Main application entry point
├── dist/                 # Compiled output (generated)
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── nodemon.json          # Nodemon configuration
└── package.json          # Project dependencies
```

## Environment Variables

See `.env.example` for all available environment variables.

## Development Roadmap

- [x] Phase 1, Step 1: Basic Express server with health check
- [ ] Phase 1, Step 2: Database setup (PostgreSQL + TimescaleDB)
- [ ] Phase 1, Step 3: Data ingestion layer
- [ ] Phase 2: API endpoints development
- [ ] Phase 3: Real-time WebSocket support

## License

ISC
