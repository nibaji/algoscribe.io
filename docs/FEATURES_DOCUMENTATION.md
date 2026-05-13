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

- Added `app/login.tsx` for authentication flow.
- Added `app/(tabs)/process-voice.tsx` for the main dictation and transcription UI.
- Integrated `expo-secure-store` for token management.
- Integrated `expo-document-picker` for audio upload.
- Setup `services/api.ts`, `services/auth.ts`, and `services/voice.ts` for handling backend communication.
- Web app reconnaissance is captured in `docs/WEB_APP_RECON.md`.

## Navigation

Current routes come from the starter template:

- `app/_layout.tsx` (Root layout mapping `index`, `login`, and `(tabs)`)
- `app/index.tsx` (Entry route handling redirection based on Auth State)
- `app/login.tsx` (Login Screen)
- `app/(tabs)/_layout.tsx` (Tab navigation)
- `app/(tabs)/process-voice.tsx` (Main Voice Processing UI)

Replace or restructure these routes when the actual app screen requirements are provided. Keep navigation notes updated here.

## API and Data Flow

The app currently connects to `https://emr-api-uae-test.blackglacier-b674de0c.uaenorth.azurecontainerapps.io`.
- `services/auth.ts` implements `POST /auth/signin` and `GET /user/find-all-access`.
- `services/voice.ts` implements `POST /medicalscribe/extract-input` with multipart/form-data upload.
- `services/api.ts` provides `fetchWithAuth` wrapper injecting Bearer token from SecureStore.

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
