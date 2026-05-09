# AI Agent Instructions - algoscribe.io

This is the single source of truth for AI agents working in this repository.

## Quick Start

Before making changes:

1. Read this file.
2. Read `ENGINEERING_STANDARDS.md`.
3. Check `docs/FEATURES_DOCUMENTATION.md` for current architecture and feature notes.
4. Keep `changelog/upcoming.md` updated for every code or behavior change.
5. Run verification before handing work back:

```bash
bun run verify
```

If `bun run verify` cannot run in the current environment, report the exact command and reason.

## Mandatory Documentation Rule

For every meaningful change:

- Update `changelog/upcoming.md` with the date, summary, and important files changed.
- Update `docs/FEATURES_DOCUMENTATION.md` when behavior, screens, navigation, API contracts, architecture, or user flows change.
- Update other docs in `docs/` when a change affects release, quality, setup, or agent workflow.
- Do not commit or hand off code without documenting the change.

## Current Stack

- Framework: Expo + React Native
- Router: Expo Router
- Language: TypeScript strict mode
- Package manager: Bun (`bun.lock` is the source of truth)
- Styling: React Native `StyleSheet` with centralized design tokens
- Web: Expo static web output is enabled in `app.json`

## Architecture Rules

Use this target structure as the app grows:

```text
app/          routing only, Expo Router layouts and screens
components/   reusable UI components only
features/     business logic by domain
services/     API clients, storage, analytics, side effects
hooks/        reusable cross-feature hooks
utils/        pure utilities
constants/    app-wide constants
theme/        design tokens
types/        shared TypeScript types
docs/         architecture, release, and operational documentation
```

Rules:

- Keep route files thin. Move screen logic into `features/` and reusable UI into `components/`.
- Do not call APIs directly from components.
- Avoid cross-feature imports; share through `services/`, `types/`, or explicit common utilities.
- Avoid circular dependencies.
- Prefer existing Expo and React Native primitives before adding dependencies.

## TypeScript Rules

- Do not use `any` or `as any`.
- Prefer specific interfaces, discriminated unions, or `unknown` with narrowing.
- Add explicit return types to exported functions, hooks, services, and components.
- Fix TypeScript errors before handoff.
- Do not silence lint or compiler errors unless a documented exception is approved.

## UI and Styling Rules

- Use `StyleSheet.create()` for static styles.
- Inline styles are only for runtime dynamic values.
- Use theme/design tokens for colors, spacing, typography, radius, and shadows once tokens exist.
- Do not hardcode repeated visual values in feature code.
- Use `Pressable` for touch interactions.
- Use Expo Router headers where possible instead of custom title text.
- Account for safe areas and scrollable content on mobile and web.
- Do not use `&&` for JSX conditional rendering. Use `condition ? <Component /> : null`.

## Expo Rules

- Start with Expo Go and `bun run start` unless a feature requires a development build.
- Do not run native builds unless native modules or config changes require them.
- Keep `app.json` as the source for Expo config until the project needs `app.config.ts`.
- Keep assets and app metadata generic unless product-specific requirements are provided.

## Security Rules

- Do not commit secrets, tokens, API keys, or credentials.
- Do not log PII, tokens, or sensitive request payloads.
- Validate external data at service boundaries.
- Assume client-side checks can be bypassed.
- Use secure storage for secrets on native platforms when authentication is added.

## Release and Changelog Rules

- Release identifiers use `YYYYMMDD.N`, for example `20260510.1`.
- Unreleased changes live in `changelog/upcoming.md`.
- On release, move relevant entries into `changelog/<release>.md`, reset `upcoming.md`, and update `CHANGELOG.md`.
- Do not mix unrelated release notes into a feature change.

## Agent Guardrails

- Read before editing. Do not rewrite starter code unless the requested screen or architecture requires it.
- Preserve user changes in the worktree.
- Keep changes scoped to the request.
- Use `rg` for search.
- Use `apply_patch` for manual edits.
- Prefer small, reviewable files over large mixed-responsibility files.
- Before handoff, run verification or clearly state why it could not be run.

## Useful Commands

```bash
bun install
bun run start
bun run web
bun run lint
bun run typecheck
bun run verify
```

