## What & why

<!-- What does this change, and what problem does it solve? Link issues with "Fixes #123". -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (input/output contract in `action.yml` changes)
- [ ] Docs / internal only

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm run format` applied
- [ ] `npm test` passes
- [ ] **`npm run build` was re-run and the updated `dist/` is committed**
- [ ] `action.yml` inputs/outputs updated and documented in `README.md`
- [ ] Tested against a real workflow run, not just locally

> The Action runs the committed `dist/` bundle, not `src/`. A PR that changes
> `src/` without a rebuilt `dist/` will merge but will not take effect.

## Notes for the reviewer

<!-- Link a workflow run showing the change working, if you have one. -->
