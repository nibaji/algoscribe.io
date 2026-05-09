# Engineering Standards

These standards are mandatory for generated and manually written code in `algoscribe.io`.

## 1. Project Context

- Framework: Expo + React Native
- Language: TypeScript strict mode
- Routing: Expo Router
- Package manager: Bun
- Refactor policy: refactor incrementally, do not rewrite without a clear reason

## 2. Absolute Constraints

1. Do not change unrelated runtime behavior.
2. Do not remove features unless explicitly requested.
3. Do not introduce dependencies unless they materially reduce risk or complexity.
4. Do not weaken security for convenience.
5. Do not bypass ESLint or TypeScript errors.
6. If a requirement cannot be met safely, stop and explain the blocker.

## 3. Folder Ownership

```text
app/          routing only
components/   UI components only
features/     domain-specific state and business logic
services/     API, storage, analytics, side effects
hooks/        reusable logic
utils/        pure functions
constants/    constants
theme/        design tokens
types/        shared types
```

Move misplaced logic into the correct folder as features are built.

## 4. File Size Limits

| File Type | Max Lines |
| --------- | --------- |
| Component | 250 |
| Hook | 150 |
| Service | 200 |
| Utility | 100 |
| Constant | 500 |

If a file exceeds the limit, split it by responsibility.

## 5. Import Rules

- Prefer absolute imports through the configured `@/*` alias.
- Avoid deep relative imports like `../../..`.
- Keep import direction simple: UI can depend on hooks/features, features can depend on services/utils/types, services can depend on utils/types.
- Do not create circular dependencies.

## 6. API Rules

When APIs are introduced:

- All HTTP access goes through a service layer.
- Components must not call `fetch` directly.
- Request and response types must be explicit.
- Validate external responses before trusting them.
- Fail closed on ambiguous or malformed data.
- Keep auth, retry, timeout, and base URL behavior centralized.

## 7. Security Rules

- No secrets in source code.
- No tokens or PII in logs.
- Use SecureStore or platform-appropriate secure storage for sensitive native data.
- Keep access control checks in services/routes where they are reusable.
- Treat client-side validation as UX only, not security.

## 8. TypeScript and Linting

- `strict: true` is required.
- No `any`.
- No `as any`.
- Exported functions, hooks, components, and services require explicit return types.
- Prefer `T[]` over `Array<T>`.
- Avoid `require()` in TypeScript files.
- ESLint must pass without new disable comments.

## 9. Styling Rules

- Use `StyleSheet.create()` for static styles.
- Use theme tokens for repeated colors, spacing, typography, radius, and shadow values.
- Inline styles are allowed only for dynamic runtime values.
- Avoid magic numbers in feature UI.
- Keep layout responsive across native and web.
- Do not use legacy shadow props or elevation when `boxShadow` is supported by the current target.

## 10. JSX Rendering

Do not use `&&` for conditional rendering in JSX.

```tsx
// Correct
{isReady ? <Content /> : null}

// Avoid
{isReady && <Content />}
```

## 11. Low-Level Code Quality

- Single responsibility per file.
- Pure functions by default.
- Prefer explicit naming over cleverness.
- Remove unused variables and imports.
- Keep React hook dependencies correct.
- Memoize only when it prevents real work or unstable references.

## 12. Documentation and Release

Every meaningful change must update:

- `changelog/upcoming.md`
- `docs/FEATURES_DOCUMENTATION.md` when architecture, behavior, navigation, or API contracts change
- Relevant docs under `docs/`

Release notes are covered in `docs/RELEASE_PROCESS.md`.

