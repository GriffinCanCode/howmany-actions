# test

Standalone Node scripts that exercise the action without a GitHub runner. They
are plain scripts rather than a test framework because what they check is mostly
*wiring* — that `action.yml` declares the inputs `src/main.ts` reads, that the
compiled output in `lib/` behaves, that the quality gate returns the verdicts the
thresholds imply.

| File | What it covers |
|---|---|
| `test-local.js` | Smoke test: `action.yml` parses and declares what the code expects. |
| `test-integration.js` | The quality-gate evaluator against representative analysis output. |
| `test-comprehensive.js` | The full input surface, including threshold edge cases. |
| `test-github-simulation.js` | A simulated runner environment, including the event payload. |

Run them from the repository root, not from this directory — they read
`action.yml` and `package.json` by path relative to the working directory:

```bash
npm run build       # test-integration and test-comprehensive need lib/
npm test            # test-local.js only
npm run test-full   # local + integration + comprehensive
```

`test-github-simulation.js` is not in `test-full`; run it directly when changing
how the action reads its environment:

```bash
node test/test-github-simulation.js
```
