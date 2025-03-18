# Butterfly SDK

A high-performance security analysis SDK with AI-powered agents for comprehensive codebase security scanning.

## Features

- 🔍 **Comprehensive Security Analysis**
  - Input validation & injection detection
  - Authentication & authorization checks
  - Dependency vulnerability scanning
  - Infrastructure security analysis
  - Code quality & cryptography review

- ⚡ **High Performance**
  - Parallel processing with worker threads
  - Efficient file traversal
  - Smart caching system
  - Memory-efficient AST parsing

- 🛡️ **Type Safety**
  - Full TypeScript support
  - Strict type checking
  - Protocol Buffer validation
  - Runtime type safety

- 🔄 **Modern Architecture**
  - gRPC for inter-agent communication
  - Event-driven architecture
  - Modular agent system
  - Extensible plugin system

## Installation

```bash
npm install butterfly-sdk
# or
yarn add butterfly-sdk
```

## Quick Start

```typescript
import { Butterfly } from 'butterfly-sdk';

const butterfly = new Butterfly({
  maxWorkers: 4,
  cacheStrategy: 'MEMORY',
  analysisMode: 'FULL'
});

const results = await butterfly.analyze('./my-project');
console.log(results);
```

## CLI Usage

```bash
# Install globally
npm install -g butterfly-sdk

# Run analysis
butterfly analyze ./my-project

# Run with options
butterfly analyze ./my-project --workers 8 --cache disk --mode incremental
```

## Configuration

Create a `butterfly.config.ts` file in your project root:

```typescript
export default {
  maxWorkers: 4,
  cacheStrategy: 'MEMORY',
  analysisMode: 'FULL',
  fileFilters: [
    {
      shouldProcess: (file) => !file.includes('node_modules'),
      getPriority: (file) => file.endsWith('.ts') ? 2 : 1
    }
  ]
};
```

## Architecture

### Core Components

1. **Input & Data Security Agent**
   - SQL injection detection
   - XSS prevention
   - File upload security
   - Data leakage prevention

2. **Authentication & Authorization Agent**
   - JWT validation
   - Role-based access
   - Session management
   - OAuth security

3. **Dependency & Supply Chain Agent**
   - Vulnerability scanning
   - License compliance
   - Supply chain attacks
   - Dependency updates

4. **Infrastructure & Configuration Agent**
   - Container security
   - Cloud config validation
   - Environment security
   - API endpoint security

5. **Code Quality & Cryptography Agent**
   - Static analysis
   - Crypto best practices
   - Code patterns
   - Language-specific security

### Performance Optimizations

- Worker thread pool for parallel processing
- Memory-efficient AST traversal
- Incremental analysis support
- Smart caching strategy
- Lazy loading of heavy dependencies

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Format
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by modern security scanning tools
- Built with performance and scalability in mind
- Powered by AI-driven analysis
