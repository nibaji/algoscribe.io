# Upcoming Changelog

This file stores unreleased changes since the last release.

When a release tag is created using `YYYYMMDD.N`, move relevant content from this file into `changelog/<release>.md`, then reset this file to the template below.

## (next release)

- 2026-05-10: Added repository-level AI agent guardrails, engineering standards, release workflow, feature documentation scaffold, code quality guide, and agent skills guide. Updated package scripts with `typecheck` and `verify`.
- 2026-05-10: Added live web app reconnaissance for `algoscribe.io`, including auth flow, process-voice UI notes, endpoint inventory, and tested `.m4a` upload/transcription behavior. Changed in `docs/WEB_APP_RECON.md` and `docs/FEATURES_DOCUMENTATION.md`.
- 2026-05-10: Implemented the login screen and process voice UI in Expo based on the web recon. Added `api.ts`, `auth.ts`, and `voice.ts` services. Used `expo-secure-store` for token management and `expo-document-picker` for audio upload. Updated App routing.
- 2026-05-10: Ported low-level patterns from `algoscribe` repo. Migrated fetch wrappers to `ApiClient` with exponential backoff and Web/Native `FormData` handling. Replaced static tokens with robust `tokenStore` (supporting `sessionStorage` on Web and `SecureStore` on Native). Added automatic Token Refresh queuing and logging.
