---
title: Free-tier MVP hosting decision
status: Accepted for MVP evaluation
version: 1.0
date: 2026-11-13
---

# ADR-0001 — Free-tier MVP hosting

## Context

PanelForge is being built as a SaaS MVP. The immediate goal is to keep hosting spend at zero or near zero while preserving a conventional architecture that can later move to AWS or Azure. The repository currently uses a Next.js web application, a NestJS REST API and PostgreSQL through Prisma.

A free plan is not the same as open-source infrastructure. The selected providers are managed services with free tiers; the application stack and database engine use open-source technologies.

## Decision

Evaluate and use the following topology for the MVP:

- **Web — Cloudflare Workers.** Deploy the Next.js application through a compatible adapter. Validate the exact Next.js 16.4.2 application before treating this as production-ready.
- **API — Render free web service.** Host the NestJS API. Accept sleep after inactivity and cold starts during MVP development.
- **Database — Neon free PostgreSQL.** Use managed PostgreSQL for persistent MVP data. Keep migrations portable and avoid provider-specific database features.
- **CI — GitHub Actions.** Continue using the existing repository workflows, subject to account usage limits.

Do not use Render's free PostgreSQL as the durable database because the free database has a limited lifetime. Do not assume Cloudflare Workers supports every Next.js Node runtime feature or that the application will fit within free CPU limits.

## Trade-offs and constraints

| Area | Benefit | Constraint / risk | Mitigation |
|---|---|---|---|
| Cloudflare Workers | Low-cost edge deployment and generous request allowance on free tier | Next.js adapter compatibility, CPU limits, runtime API differences | Run build, route, auth-cookie and SSR smoke tests on the deployed preview |
| Render free API | Simple service deployment without managing a VM | Sleeps when idle; cold start; free instance limits and ephemeral filesystem | Keep API stateless; persist files in object storage if needed; accept MVP cold starts |
| Neon free PostgreSQL | Managed PostgreSQL with scale-to-zero | Compute, storage, connection and transfer quotas | Monitor usage; use connection pooling where appropriate; maintain logical backups/export plan |
| GitHub Actions | Existing CI integration | Private-repository minutes/storage may be limited by plan | Monitor usage; keep jobs parallel only when useful |

Free-tier quotas, pricing, retention and terms can change. Re-check provider documentation and account limits before launch and whenever usage grows.

## Security and operations requirements

- No secrets in source control, build logs, browser bundles or client-side environment variables.
- Use separate development and staging credentials.
- Configure database TLS and least-privilege database credentials.
- Restrict CORS to known web origins.
- Configure protected GitHub Environments for staging secrets and deployment approvals.
- Keep PostgreSQL migrations provider-neutral.
- Test backups/exports and restoration before storing important customer data.
- Monitor free-tier usage, service sleep/cold starts and database limits.
- Do not place production customer data on free tiers without reviewing provider terms, data residency, backup, support and availability requirements.

## AWS/Azure migration path

Keep application deployment portable:

1. Build the API as a stateless container and deploy it to AWS ECS/Fargate or Azure Container Apps.
2. Deploy the web app to a supported Node/container hosting target, or evaluate managed edge hosting only after runtime compatibility review.
3. Move PostgreSQL to Amazon RDS/Aurora PostgreSQL or Azure Database for PostgreSQL using logical backup/restore or a controlled replication migration.
4. Move secrets to AWS Secrets Manager or Azure Key Vault.
5. Move logs/metrics/traces to CloudWatch/X-Ray or Azure Monitor/Application Insights.
6. Keep CI/CD provider-neutral and use environment-specific deployment workflows.

Avoid coupling business logic to Cloudflare, Render or Neon APIs. Keep object storage behind an application abstraction if introduced.

## Acceptance checklist before MVP launch

- [ ] Deploy the actual Next.js app to a Cloudflare preview and verify routes, authentication cookies, server rendering and runtime compatibility.
- [ ] Verify CPU usage for representative SSR requests.
- [ ] Deploy the NestJS API to Render and verify health/readiness, CORS, TLS and cold-start behaviour.
- [ ] Provision Neon PostgreSQL and apply Prisma migrations from a clean database.
- [ ] Verify connection pooling and connection limits.
- [ ] Configure protected staging secrets without committing values.
- [ ] Run end-to-end smoke tests against the deployed staging environment.
- [ ] Verify database export/restore procedure.
- [ ] Review provider free-tier quotas and terms at the time of launch.

## Consequences

The MVP can be operated with minimal hosting spend, but it is not a high-availability production architecture. Cold starts, quotas, provider dependency and limited free-tier support are accepted temporarily. The architecture must remain stateless and PostgreSQL-portable so the later AWS/Azure migration is operational rather than a rewrite.
