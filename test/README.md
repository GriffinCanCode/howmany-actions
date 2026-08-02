# test

Standalone Node scripts that exercise the action without a GitHub runner. They
are plain scripts rather than a test framework because what they check is mostly
*wiring* — that `action.yml` declares the inputs `src/main.ts` reads, that the
compiled output in `lib/` behaves, that the quality gate returns the verdicts the
thresholds imply.

They carry a `.cjs` extension because the package itself is ESM: the `@actions/*`
toolkit ships ESM only, so `src/` and `lib/` are modules and these `require`-based
scripts are not.

| File | What it covers |
|---|---|
| `test-local.cjs` | Smoke test: `action.yml` parses and declares what the code expects. |
| `test-integration.cjs` | The quality-gate evaluator against representative analysis output. |
| `test-comprehensive.cjs` | The full input surface, including threshold edge cases. |
| `test-github-simulation.cjs` | A simulated runner environment, including the event payload. |

Run them from the repository root, not from this directory — they read
`action.yml` and `package.json` by path relative to the working directory:

```bash
npm run build       # test-integration and test-comprehensive need lib/
npm test            # test-local.cjs only
npm run test-full   # local + integration + comprehensive
```

`test-github-simulation.cjs` is not in `test-full`; run it directly when changing
how the action reads its environment:

```bash
node test/test-github-simulation.cjs
```
