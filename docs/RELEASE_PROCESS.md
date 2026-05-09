# Release Process

Release identifiers use:

```text
YYYYMMDD.N
```

Examples:

- `20260510.1`
- `20260510.2`

## Before Release

1. Run verification:

```bash
bun run verify
```

2. Review `changelog/upcoming.md`.
3. Confirm `docs/FEATURES_DOCUMENTATION.md` reflects current app behavior.
4. Confirm no secrets or local-only files are staged.

## Create Release Notes

1. Create `changelog/<release>.md`.
2. Move relevant entries from `changelog/upcoming.md` into that file.
3. Reset `changelog/upcoming.md` to the unreleased template.
4. Add the new release file to `CHANGELOG.md` under Versions.

## Versioning

When an app binary or public web release is produced, align the version in `package.json` and Expo config with the release identifier when practical.

Do not update versions for documentation-only changes unless a release is being prepared.

