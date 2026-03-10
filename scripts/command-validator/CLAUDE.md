# Command Validator - CLAUDE.md

This file provides guidance to Claude Code when working with the command-validator security package.

## Project Purpose

**Command Validator** is a security validation package for Claude Code's PreToolUse hook. It validates bash commands before execution to prevent dangerous operations like:
- System destruction (rm -rf /, dd, mkfs)
- Privilege escalation (sudo, chmod, passwd)
- Network attacks (nc, nmap, telnet)
- Malicious patterns (fork bombs, backdoors)
- Sensitive file access (/etc/passwd, /etc/shadow)

The validator is integrated as a hook in Claude Code settings and blocks dangerous commands while allowing safe operations.

## Runtime: Node.js + tsx

This project uses **Node.js** with **tsx** as TypeScript runner. No Bun required.

## Development Commands

### Testing (Primary Workflow)
- `npx vitest run` - Run all tests
- `npx vitest` - Run tests in watch mode
- `npx vitest --ui` - Run tests with UI interface

### Code Quality
- `npm run lint` - Run Biome linter and auto-fix
- `npm run format` - Format code with Biome
- `npx tsc --noEmit` - TypeScript type checking

### Execution
- `npx tsx src/cli.ts` - Run CLI validator directly
- `npm install` - Install dependencies

## Development Workflow

### Test-Driven Development Cycle
1. **Run tests**: `npx vitest run`
2. **Read errors**: Analyze test failures carefully
3. **Fix the problem**: Make minimal changes to pass tests
4. **Re-run tests**: `npx vitest run` until ALL tests pass

## Architecture Overview

```
src/
├── cli.ts                 # CLI entry point (used by Claude Code hook)
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── security-rules.ts  # Security rules database
│   └── validator.ts       # Core validation logic
└── __tests__/
    └── validator.test.ts  # Comprehensive test suite (128+ tests)
```

### Key Files
- **src/lib/validator.ts** - Core CommandValidator class
- **src/lib/security-rules.ts** - Security rules database
- **src/__tests__/validator.test.ts** - All test cases

## Code Conventions

- **TypeScript**: Strict mode enabled
- **Testing**: Vitest with comprehensive coverage (128+ tests)
- **Linting**: Biome for formatting and linting
- **Imports**: ESM module format only

## Common Modifications

1. **Adding new security rules** → Update `src/lib/security-rules.ts`
2. **Modifying validation logic** → Update `src/lib/validator.ts`
3. **Adding test cases** → Update `src/__tests__/validator.test.ts`
4. **Run tests after each change** → `npx vitest run`
