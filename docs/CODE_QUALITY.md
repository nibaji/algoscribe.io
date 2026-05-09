# Code Quality

The default verification command is:

```bash
bun run verify
```

This runs:

- `bun run typecheck`
- `bun run lint`

## Baseline Expectations

- TypeScript strict mode stays enabled.
- ESLint passes before handoff.
- No `any` or `as any`.
- No new unused code.
- No new lint disable comments without a documented reason.
- New features include loading, empty, and error states when applicable.
- User-visible changes update documentation and changelog.

## Review Checklist

Before handing work back:

- Confirm changed files are scoped to the request.
- Check route files are not carrying business logic.
- Check service calls are centralized.
- Check visual values are consistent with the design system.
- Check mobile and web layout constraints where the screen is cross-platform.
- Run verification or document why it was not possible.

