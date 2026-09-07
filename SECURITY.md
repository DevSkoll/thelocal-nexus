# Security Policy

## Supported versions

This project is pre-1.0. Security fixes land on `main`.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

Use GitHub’s private vulnerability reporting on
[DevSkoll/thelocal-nexus](https://github.com/DevSkoll/thelocal-nexus/security/advisories/new).

Include:

- A description of the issue and impact
- Steps to reproduce (or a proof of concept)
- Affected routes, env vars, or data stores if you know them

We will acknowledge the report and follow up with a fix or a decision. Please give us a reasonable window before any public disclosure.

## What this project stores

- Phone numbers are the primary identity and **must never** appear in public API responses or client payloads.
- SQLite databases, `.env` files, and uploaded images are gitignored. Do not attach real production data to issues or PRs.
- Demo seed personas use reserved / fictional phone numbers only (see [docs/DEMO-PERSONAS.md](docs/DEMO-PERSONAS.md)).
