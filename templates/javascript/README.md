# {{project-name}}

{{description}}

A {{Language}} project created with the Node.js Express Template for claude-wizard.

## Features

- 🚀 Express.js web framework
- 🔒 Security middleware with Helmet
- 🌐 CORS support for cross-origin requests
- 📦 Environment configuration with dotenv
- 🧪 Testing with Jest and Supertest
- 🔧 Code quality with ESLint and Prettier
- 🔥 Development server with Nodemon
- 📊 Health check endpoint
- ⚡ Modern ES6+ JavaScript

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# The server will be running at http://localhost:3000
```

### Production

```bash
# Start production server
npm start
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run the test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code for linting issues
- `npm run lint:fix` - Automatically fix linting issues
- `npm run format` - Format code with Prettier

## API Endpoints

### GET /
Returns welcome message and application information.

**Response:**
```json
{
  "message": "Welcome to {{project-name}}!",
  "version": "1.0.0",
  "author": "{{author}}",
  "year": {{year}},
  "timestamp": "2024-08-24T10:30:00.000Z"
}
```

### GET /health
Returns application health status.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2024-08-24T10:30:00.000Z"
}
```

## Environment Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

Available environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

```
{{project-name}}/
├── src/
│   └── index.js          # Main application file
├── tests/
│   └── index.test.js     # Test suite
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore patterns
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Tests include:
- API endpoint validation
- Response format verification
- Error handling
- Health check functionality

## Code Quality

This project uses ESLint for code linting and Prettier for formatting:

```bash
# Check for linting issues
npm run lint

# Automatically fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Docker Support

(Optional) Add Docker support by creating a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Created by {{author}} in {{year}} using the claude-wizard bootstrap system.