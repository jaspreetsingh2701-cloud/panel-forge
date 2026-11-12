---
title: Phase 2.5 engineering quality plan
status: Active
version: 0.2
last_updated: 2026-11-13
source_of_truth: true
---

# Phase 2.5 — Engineering quality foundation

## Goal

Establish repeatable local and pull-request checks before building the metadata engine. Quality tooling is delivered in verifiable increments.

## Delivery status

| Batch | Scope | Status |
|---|---|---|
| 2.5.1 | GitHub Actions CI baseline and PR template | Complete — PR #15 merged |
| 2.5.2 | ESLint, Prettier, Husky, lint-staged, Commitlint and Changesets | Complete — PR #16 merged |
| 2.5.3 | Jest API tests, React Testing Library, coverage thresholds and PostgreSQL integration-test setup | In progress |
| 2.5.4 | Playwright critical-path E2E, Swagger/OpenAPI, dependency/secret/container security scans | Planned |
| 2.5.5 | Staging workflow, smoke tests and release/rollback checklist | Planned |

Batches 2.5.3–2.5.5 are being delivered in one consolidated PR. Do not mark the phase complete until every batch has passed its exit criteria.

## Batch 2.5.1 — CI baseline

Complete — merged in PR #15.

- GitHub Actions runs on pull requests targeting main and pushes to main.
- Uses the repository Node.js version and pinned pnpm version.
- Installs dependencies with `pnpm install --frozen-lockfile`.
- Runs API and web TypeScript checks and production builds.
- Supplies non-production CI-only values for API configuration validation.
- Adds a pull request template covering validation, tenancy and security considerations.

## Batch 2.5.2 — Lint, formatting and commit quality

Complete — merged in PR #16.

- Shared ESLint flat configuration using Next.js Core Web Vitals and TypeScript presets.
- Prettier repository configuration and ignore rules.
- Lint, lint:fix, format:check and Husky scripts.
- lint-staged before commits and Commitlint for Conventional Commits.
- Changesets configured for controlled package versioning.
- Formatting and lint checks run in GitHub Actions before typecheck/build.

Hooks provide local feedback, not a security boundary; CI remains authoritative.

## Batch 2.5.3 — Unit, component and database integration tests

Exit criteria:

- API Jest tests run locally and in CI.
- Web component tests use Jest and React Testing Library with a DOM environment.
- PostgreSQL integration tests run against a disposable PostgreSQL service, not SQLite or mocked SQL semantics.
- Coverage thresholds are enforced only after meaningful baseline tests exist: statements 70%, branches 60%, functions 70%, lines 70%.
- Test fixtures are deterministic and clean up after themselves.
- At least two-tenant negative tests are added as tenant-scoped functionality is introduced; do not fabricate tests for endpoints that do not exist yet.

## Batch 2.5.4 — E2E, API contract and security

Exit criteria:

- Playwright exercises existing critical user journeys with deterministic test data.
- Swagger/OpenAPI is exposed from the NestJS API in non-production environments and can be generated/validated in CI.
- Dependency review/audit, secret scanning and container scanning run with documented triage and severity policy.
- Security scans do not block merges on unreviewed informational noise; high-confidence critical findings fail the relevant gate.
- Browser tests do not require production credentials or customer data.

## Batch 2.5.5 — Staging, smoke tests and release safety

Exit criteria:

- Staging deployment is protected by a GitHub Environment and required secrets.
- Deployment uses immutable build artifacts and applies backward-compatible database migrations.
- Smoke tests validate API readiness and the deployed web/API integration.
- Rollback instructions distinguish application rollback from database rollback.
- No production deployment or production secrets are introduced by this phase.

## Hosting decision

The MVP hosting choice and its constraints are recorded in [ADR-0001 — Free-tier MVP hosting](../01-architecture/decisions/0001-free-tier-mvp-hosting.md). Free managed tiers are a cost-conscious MVP choice, not a claim that the hosting providers themselves are open-source.

## Definition of done

Phase 2.5 is complete only when all batches have verified local instructions, CI enforcement, documented failure handling and no unresolved critical security or reliability gaps. A workflow file existing in the repository is not proof that a deployment or test has been validated.
