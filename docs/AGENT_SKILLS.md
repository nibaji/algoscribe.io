# Agent Skills and Workflow

This repository uses project documentation as the portable agent skill layer.

## Required Agent Reading Order

1. `AGENTS.md`
2. `ENGINEERING_STANDARDS.md`
3. `docs/FEATURES_DOCUMENTATION.md`
4. Relevant files for the requested feature

## Expo Native UI Work

Use the Expo and React Native guidance in `AGENTS.md` and `ENGINEERING_STANDARDS.md`.

When building screens:

- Prefer existing project components and tokens.
- Keep route files thin.
- Build complete states for loading, empty, error, and success.
- Verify text fits on mobile and web.
- Prefer Expo-compatible libraries and Expo Go first.

## API or Data Fetching Work

When adding network behavior:

- Add a typed service under `services/`.
- Normalize errors at the service boundary.
- Keep components free of direct HTTP calls.
- Document the API contract in `docs/FEATURES_DOCUMENTATION.md`.

## Release Work

Use `docs/RELEASE_PROCESS.md`.

Agents must not prepare a release without updating `CHANGELOG.md`, `changelog/upcoming.md`, and the relevant release file.

## Quality Work

Use `docs/CODE_QUALITY.md`.

Run `bun run verify` before handoff unless blocked by missing dependencies or environment constraints.

