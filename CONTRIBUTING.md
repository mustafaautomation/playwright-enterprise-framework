# Contributing

## Setup

```bash
git clone https://github.com/mustafaautomation/playwright-enterprise-framework.git
cd playwright-enterprise-framework
npm install
npx playwright install
cp .env.example .env
```

## Adding a New Test

1. Create spec file in the appropriate `tests/` subdirectory
2. Use existing fixtures from `src/fixtures/index.ts`
3. Tag tests: `@smoke` for critical paths, `@regression` for everything
4. Follow Page Object Model — no raw selectors in test files

### File Naming

- Page objects: `src/pages/FeaturePage.ts` (PascalCase)
- Test specs: `tests/e2e/feature/feature.spec.ts` (kebab-case)
- Components: `src/components/ComponentName.ts` (PascalCase)

### Adding a New Page Object

1. Create class extending `BasePage` in `src/pages/`
2. Export from `src/pages/index.ts`
3. Register as fixture in `src/fixtures/index.ts`

## Code Quality

Pre-commit hooks enforce:
- **Prettier** formatting (single quotes, trailing commas, 100 char width)
- **ESLint** checks (TypeScript strict, no unused vars)

Run manually:
```bash
npm run lint        # Check
npm run lint:fix    # Auto-fix
npm run format      # Format all
```

## Running Tests

```bash
npm test              # Full suite, all browsers
npm run test:smoke    # Smoke tests only
npm run test:chromium # Single browser
npm run test:debug    # Interactive debugger
npm run test:ui       # Playwright UI mode
```

## Pull Request Process

1. Create feature branch from `main`
2. Write tests first (TDD preferred)
3. Ensure `npm run lint` and `npm run format:check` pass
4. All tests green: `npm test`
5. Open PR using the provided template
6. Squash merge after approval

## Commit Messages

Format: `type: description`

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`

Examples:
- `feat: add product detail page tests`
- `fix: filter manifest icons from broken images check`
- `test: add multi-user scenario coverage`
