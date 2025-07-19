# Contributing to HowMany GitHub Action

Thank you for your interest in contributing to the HowMany GitHub Action! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/howmany-action.git
   cd howmany-action
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Make your changes in the `src/` directory

5. Build the action:
   ```bash
   npm run build
   ```

6. Test your changes:
   ```bash
   npm test
   ```

## Development Workflow

### Code Style

- We use TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

Run these commands to maintain code quality:

```bash
npm run lint        # Check for linting errors
npm run format      # Format code with Prettier
npm run build       # Build the distributable
```

### Building

The action uses `@vercel/ncc` to compile TypeScript and dependencies into a single JavaScript file:

```bash
npm run build       # Full build (TypeScript + ncc)
npm run package     # Just ncc packaging
```

### Testing

When testing changes:

1. Build the action locally
2. Test with a sample repository
3. Verify all output formats work correctly
4. Check that quality gates function properly

## Project Structure

```
howmany-action/
├── src/
│   ├── main.ts                  # Main action entry point
│   ├── types/
│   │   └── howmany.ts          # TypeScript interfaces
│   └── utils/
│       ├── howmany-installer.ts # CLI installation logic
│       └── quality-gate.ts      # Quality gate evaluation
├── dist/                        # Built JavaScript (auto-generated)
├── .github/workflows/          # Example workflows
├── action.yml                  # Action configuration
└── README.md                   # Documentation
```

## Making Changes

### Adding New Features

1. Update `action.yml` with new inputs/outputs
2. Add TypeScript interfaces in `src/types/howmany.ts`
3. Implement logic in appropriate files
4. Update documentation in `README.md`
5. Add example workflows if needed

### Updating CLI Integration

When HowMany CLI changes:

1. Update TypeScript interfaces to match new Rust structs
2. Update CLI argument mapping in `main.ts`
3. Test with latest HowMany version
4. Update version constraints if needed

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code passes linting and builds successfully
4. Update documentation as needed
5. Submit a pull request with:
   - Clear description of changes
   - Test results
   - Example usage if applicable

### PR Requirements

- [ ] Code builds successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Changes are tested

## Versioning

We follow semantic versioning (SemVer):

- **Major** (v1.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.0.1): Bug fixes, backward compatible

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag
4. GitHub Actions will automatically publish

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues and discussions
- Review the main HowMany repository for CLI-related questions

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to improve code analysis tooling together!

## License

By contributing, you agree that your contributions will be licensed under the MIT License. 