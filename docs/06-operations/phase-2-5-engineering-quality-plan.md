---
title: Phase 2.5 engineering quality plan
status: Active
version: 0.1
last_updated: 2026-11-13
source_of_truth: true
---

# Phase 2.5 — Engineering quality foundation

## Goal

Establish repeatable local and pull-request checks before building the metadata engine. Quality tooling is delivered in small increments so every new gate is installable, reproducible and verified rather than adding untested dependencies in one large change.

## Delivery batches

| Batch | Scope | Exit criteria |
|---|---|---|
| 2.5.1 | GitHub Actions CI baseline and PR template | Clean frozen-lockfile install; API/web typecheck and production builds run on PRs and main |
| 2.5.2 | ESLint, Prettier enforcement, Husky, lint-staged and Commitlint | Local scripts and hooks work on Windows and CI; formatting/lint checks pass |
| 2.5.3 | Jest API tests, React Testing Library, coverage thresholds and PostgreSQL integration-test setup | Unit/component tests run locally and in CI; coverage reports and thresholds are enforced |
| 2.5.4 | Playwright critical-path E2E, Swagger/OpenAPI, dependency/secret/container security scans | Browser journeys and API contract generation/validation run in CI; security checks are documented and actionable |
| 2.5.5 | Staging workflow and release/rollback checklist | Protected staging deployment and smoke-test process is documented and verified |

Batches may be split into more than one PR when dependency or runtime validation requires it. Do not mark the phase complete until every batch has passed its exit criteria.

## Batch 2.5.1 — CI baseline

Implemented in the current PR:
- GitHub Actions workflow runs on pull requests targeting `main` and pushes to `main`.
- Uses the repository Node.js version and pinned pnpm version.
- Installs dependencies with `pnpm install --frozen-lockfile`.
- Runs API and web TypeScript checks and production builds.
- Supplies non-production CI-only values for API configuration validation.
- Adds a pull request template covering validation, tenancy and security considerations.

The workflow deliberately does not start PostgreSQL: the current checks compile and build the applications but do not run database-backed tests. A PostgreSQL service will be added with the integration-test batch.

## Remaining work

- Add lint and formatting tools only alongside a committed, reproducible lockfile update.
- Add unit, component and integration tests before enforcing coverage thresholds.
- Add Playwright after stable end-to-end test fixtures and deterministic test data exist.
- Generate and validate OpenAPI after controller DTOs and response contracts are documented.
- Add security scanning with a clear triage policy; do not make noisy or unreviewed scans blocking by default.
- Add staging deployment only after a deployable environment and protected secrets are configured.

## Definition of done

Phase 2.5 is complete when all batches have verified local instructions, CI enforcement, documented failure handling and no unresolved critical security or reliability gaps.
