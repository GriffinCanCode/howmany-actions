# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.1.x   | Yes       |
| < 2.1   | No        |

## Reporting a vulnerability

Please **do not** open a public issue for a security problem.

Report privately through
[GitHub Security Advisories](https://github.com/GriffinCanCode/howmany-actions/security/advisories/new),
or by email to griffin@griffin-code.com.

Include the Action version, a workflow snippet that reproduces it, and the
impact you believe the issue has.

You can expect an acknowledgement within 72 hours and a status update within
seven days.

## Scope

This Action runs inside other people's CI with access to `GITHUB_TOKEN`. The
areas most relevant to security are:

- **Token handling** — the token must never be logged, written to an artifact,
  or interpolated into a shell command.
- **Untrusted input** — issue titles, branch names, and PR bodies reach this
  Action on `pull_request_target`. Anything interpolated into a command,
  a comment, or a step summary must be treated as attacker-controlled.
- **Tool download** — the `howmany` binary is fetched at runtime; a
  compromised download path would mean arbitrary code execution in the caller's
  runner.
- **The committed `dist/` bundle** — it is executed verbatim. Report any
  discrepancy between `dist/` and what `src/` builds to.
