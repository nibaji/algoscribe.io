# algoscribe.io Feature Documentation

This document is the living architecture and feature reference for the app.

Update it whenever screens, navigation, API contracts, state management, data flow, or user-visible behavior changes.

## Overview

`algoscribe.io` is an Expo + React Native app intended to implement the AlgoScribe web app experience on native and web surfaces.

The project currently starts from the Expo Router template. Product-specific screens and workflows should be added incrementally as requirements are provided.

## Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- TypeScript strict mode
- Bun package manager
- Static web export enabled through Expo config

## Target Architecture

```text
app/          Expo Router routes and layouts
components/   reusable UI components
features/     feature-specific state, hooks, and business logic
services/     API clients and side effects
hooks/        reusable cross-feature hooks
utils/        pure utilities
constants/    app constants
theme/        design tokens
types/        shared types
```

Route files should remain thin. Business logic belongs in `features/`; service calls belong in `services/`; reusable presentation belongs in `components/`.

## Current App State

- Expo Router tab template is present.
- `app.json` configures portrait orientation, static web output, typed routes, and React Compiler.
- No production screens from the AlgoScribe web app have been implemented yet.
- No backend API contracts have been added yet.
- Live web app reconnaissance is captured in `docs/WEB_APP_RECON.md` for the auth and Medicalscribe voice-processing flow.

## Navigation

Current routes come from the starter template:

- `app/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/explore.tsx`
- `app/modal.tsx`

Replace or restructure these routes when the actual app screen requirements are provided. Keep navigation notes updated here.

## API and Data Flow

No app API layer is defined yet.

The live web app uses an authenticated access-metadata pattern:

- `POST /auth/signin` returns access and refresh JWTs.
- `GET /user/find-all-access` returns module/access metadata used to resolve feature calls.
- Generic feature calls are addressed by module and access name in code, then resolved to concrete REST URLs.

See `docs/WEB_APP_RECON.md` for observed base URLs, endpoint inventory, and the audio extraction multipart contract.

When APIs are added:

- Create service modules under `services/`.
- Keep request/response types explicit.
- Centralize base URL, auth, timeout, retry, and error normalization.
- Validate external response shapes before exposing data to features.

## Design System

The starter app includes `constants/theme.ts`.

As screens are built, move toward a consistent token set for:

- colors
- spacing
- typography
- radius
- shadows
- timing and motion

Avoid scattering hardcoded visual values through feature code.

## Documentation Checklist

For each new feature, document:

- route path and screen ownership
- important components and hooks
- service/API contracts
- state ownership
- loading, empty, error, and offline states
- platform-specific behavior
- release notes in `changelog/upcoming.md`
