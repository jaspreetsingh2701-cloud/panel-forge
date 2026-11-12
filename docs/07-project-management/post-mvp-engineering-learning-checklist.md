---
title: PanelForge post-MVP engineering learning checklist
status: Planned
version: 0.1
last_updated: 2026-11-12
source_of_truth: true
---

# PanelForge post-MVP engineering learning checklist

## 1. Purpose

PanelForge is both a SaaS product and a hands-on engineering learning project. The MVP establishes one coherent, supportable baseline. After the end-to-end product works, use this checklist to revisit the same application and learn alternative technologies, deployment models, operational practices and engineering disciplines.

This is a **post-MVP learning backlog**, not a list of MVP dependencies. Do not add infrastructure or complexity to the critical path merely to tick a learning box.

## 2. Learning rules

- [ ] First make the baseline feature work end-to-end and add tests.
- [ ] Record the current implementation, constraints and measured baseline before experimenting.
- [ ] Change one major variable at a time where practical.
- [ ] Build a small proof of concept, benchmark or deployment exercise.
- [ ] Compare cost, complexity, security, portability, performance and operational burden.
- [ ] Record findings, diagrams, commands, screenshots and decision updates in documentation.
- [ ] Keep experiments in isolated branches, infrastructure environments or feature flags.
- [ ] Do not migrate production data or replace the working deployment without a rollback plan.
- [ ] Mark an item complete only when there is a working demonstration and written comparison.
- [ ] Promote an alternative into the product only through a reviewed ADR.

## 3. Cloud hosting and deployment

### 3.1 Deploy the same application to multiple clouds

- [ ] **AWS:** deploy Next.js and NestJS; compare App Runner, ECS/Fargate and EKS only where useful.
- [ ] **Google Cloud:** deploy to Cloud Run; understand Artifact Registry, Cloud Build and Cloud SQL.
- [ ] **Microsoft Azure:** deploy to Azure Container Apps or App Service; understand ACR and Azure Database for PostgreSQL.
- [ ] Compare managed container platforms with Kubernetes rather than assuming Kubernetes is always required.
- [ ] Compare managed PostgreSQL options, backups, point-in-time recovery, connection limits and networking.
- [ ] Compare object storage: S3, Google Cloud Storage and Azure Blob Storage.
- [ ] Compare secrets management: AWS Secrets Manager/Parameter Store, Google Secret Manager and Azure Key Vault.
- [ ] Compare IAM models, service identities, workload identity and least-privilege policies.
- [ ] Compare cloud costs for a realistic low-traffic MVP and a growth scenario.
- [ ] Document portability boundaries, vendor-specific services and migration effort.

### 3.2 Containers and delivery

- [ ] Build production Docker images for web and API.
- [ ] Understand multi-stage builds, image layers, build cache and minimal base images.
- [ ] Run containers as non-root; use health checks and graceful shutdown.
- [ ] Publish and scan images in a container registry.
- [ ] Practice environment promotion: local → test → staging → production.
- [ ] Practice blue/green and rolling deployments; understand rollback and database migration compatibility.
- [ ] Add infrastructure as code with Terraform; compare cloud-native alternatives.
- [ ] Understand Kubernetes fundamentals: Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, probes, HPA and resource requests/limits.
- [ ] Deploy an optional Kubernetes version only after managed-container deployment is understood.

## 4. Networking, ingress and web infrastructure

- [ ] Understand DNS records, domains, subdomains, TTL and DNS propagation.
- [ ] Understand TCP, ports, sockets, connection reuse and basic network troubleshooting.
- [ ] Learn HTTP/1.1, HTTP/2 and HTTP/3; compare multiplexing and connection behaviour.
- [ ] Learn TLS/HTTPS: certificates, certificate chains, ACME, renewal, TLS termination and end-to-end encryption.
- [ ] Configure Nginx as a reverse proxy in front of Next.js and NestJS.
- [ ] Configure Nginx path routing, upstreams, load balancing, health checks, timeouts, body-size limits and forwarded headers.
- [ ] Compare Nginx with a cloud load balancer and managed API gateway.
- [ ] Understand CDN caching, cache keys, cache-control, invalidation and stale content.
- [ ] Understand WAF, DDoS protection, rate limiting and bot controls.
- [ ] Trace a browser request through DNS → CDN/edge → load balancer/proxy → Next.js → NestJS → PostgreSQL.
- [ ] Document TLS termination points and trusted proxy/header configuration.

## 5. Authentication, identity and application security

- [ ] Harden custom authentication: email verification, password reset, password policy and credential abuse controls.
- [ ] Implement and test rate limits, lockout/backoff and suspicious-login monitoring.
- [ ] Learn OAuth 2.0 and OpenID Connect: actors, grants, scopes, redirect URI, state, nonce, PKCE, ID token and access token.
- [ ] Add Google sign-in and safely link an external identity to an existing PanelForge user.
- [ ] Compare Clerk and Auth0 for user management, MFA, organisations, sessions, pricing and migration.
- [ ] Implement a Cognito proof of concept and compare AWS integration and portability.
- [ ] Understand SAML, enterprise SSO, SCIM and just-in-time provisioning.
- [ ] Learn browser security: cookies, SameSite, HttpOnly, Secure, CSRF, CORS, CSP, XSS and clickjacking.
- [ ] Threat-model registration, login, refresh rotation, logout, tenant switching and account linking.
- [ ] Perform dependency, secret, container and static security scans.
- [ ] Run an OWASP Top 10 review and document mitigations.
- [ ] Evaluate passkeys/WebAuthn and MFA as later identity enhancements.

## 6. Frontend quality, accessibility and user experience

- [ ] Learn WCAG 2.2 AA and map relevant success criteria to PanelForge screens.
- [ ] Test keyboard-only navigation, focus order, focus visibility and focus trapping.
- [ ] Test screen-reader semantics, labels, accessible names, live regions and error announcements.
- [ ] Test colour contrast, zoom/reflow, reduced motion and touch target sizing.
- [ ] Use automated accessibility checks, then perform manual assistive-technology testing.
- [ ] Build accessible builder interactions: drag/drop alternatives, keyboard movement, dialogs and property panels.
- [ ] Learn Core Web Vitals: LCP, INP and CLS.
- [ ] Measure real-user metrics (RUM) and compare with lab metrics.
- [ ] Use Lighthouse and browser performance tooling; profile hydration, bundle size and rendering.
- [ ] Optimise images, fonts, code splitting, route loading and caching.
- [ ] Compare SSR, SSG, ISR and client rendering for relevant PanelForge routes.
- [ ] Document performance budgets and regression checks.

## 7. Backend, data and distributed systems

- [ ] Deepen NestJS lifecycle: modules, providers, guards, interceptors, pipes, filters and dependency injection.
- [ ] Compare REST with GraphQL for builder and runtime use cases.
- [ ] Understand PostgreSQL query plans, indexes, locks, isolation levels and connection pooling.
- [ ] Learn JSONB indexing and query trade-offs using realistic dynamic-record data.
- [ ] Evaluate PostgreSQL row-level security as defence in depth.
- [ ] Understand schema migration strategies: expand/contract, backward compatibility and zero-downtime rollout.
- [ ] Add Redis for a real use case; compare cache, session, rate-limit and queue patterns.
- [ ] Introduce a worker and queue for a concrete asynchronous workflow; learn retries, idempotency and dead-letter queues.
- [ ] Understand event-driven architecture, outbox pattern and eventual consistency.
- [ ] Compare monolith modularity with extracting one bounded context into a service.
- [ ] Study multi-tenant isolation options: shared tables, schema-per-tenant and database-per-tenant.
- [ ] Benchmark database connection pooling and application scaling.

## 8. Observability, reliability and operations

- [ ] Add structured logs with request IDs and safe redaction.
- [ ] Add metrics for latency, throughput, error rates, saturation and database health.
- [ ] Add distributed tracing across Next.js, NestJS and PostgreSQL.
- [ ] Compare OpenTelemetry with managed observability platforms.
- [ ] Evaluate Sentry for frontend/backend errors and release tracking.
- [ ] Compare Datadog, Grafana/Prometheus and cloud-native monitoring.
- [ ] Define SLIs, SLOs and error budgets for key workflows.
- [ ] Add alerts with actionable runbooks.
- [ ] Test graceful degradation, timeouts, retries and circuit breakers.
- [ ] Practice database backup restore and disaster recovery.
- [ ] Run load tests and capacity experiments; document bottlenecks.
- [ ] Practice incident response and write a postmortem for a simulated outage.

## 9. Testing and engineering productivity

- [ ] Compare unit, integration, contract and end-to-end test boundaries.
- [ ] Add API contract testing and OpenAPI compatibility checks.
- [ ] Use Playwright for cross-browser critical journeys.
- [ ] Add visual regression testing for the component registry.
- [ ] Learn mutation testing and assess whether tests detect meaningful faults.
- [ ] Test tenant isolation and role permissions with adversarial test cases.
- [ ] Add performance tests to CI for critical paths.
- [ ] Compare CI/CD strategies and deployment approvals.
- [ ] Add SBOM, dependency provenance and supply-chain checks.
- [ ] Evaluate feature flags and progressive delivery.

## 10. Product architecture and advanced platform capabilities

- [ ] Compare a shared runtime renderer with a separately deployed runtime.
- [ ] Explore plugin/extension architecture without allowing arbitrary unsafe code.
- [ ] Compare metadata schema versioning and migration strategies.
- [ ] Study audit-log integrity, retention and export.
- [ ] Explore tenant-level quotas, metering and billing architecture.
- [ ] Evaluate data residency and tenant isolation requirements.
- [ ] Explore search and analytics architecture only when product requirements justify them.
- [ ] Study AI-assisted application generation with validation and permission boundaries.

## 11. Suggested learning sequence

| Order | Focus | Practical outcome |
|---|---|---|
| 1 | Production deployment basics | Deploy current app to one cloud with HTTPS and managed PostgreSQL |
| 2 | DNS, TLS, Nginx and ingress | Put a reverse proxy/load balancer in front and trace requests |
| 3 | Security and identity | Harden custom auth, then add Google OIDC in a separate experiment |
| 4 | Accessibility and performance | WCAG audit and Core Web Vitals baseline/improvement |
| 5 | Observability and reliability | Logs, metrics, traces, alerts and restore drill |
| 6 | Cloud comparison | Repeat deployment on a second cloud and compare cost/operations |
| 7 | Advanced backend | Redis, workers, queues, GraphQL and data-layer experiments |
| 8 | Architecture alternatives | Compare managed auth, gateway and deployment topology with ADRs |

## 12. Experiment record template

For each completed experiment, record:

- **Question:** What are we trying to learn?
- **Baseline:** What does PanelForge use today?
- **Hypothesis:** What do we expect to improve or worsen?
- **Setup:** Exact cloud/service/version/configuration.
- **Implementation:** Branch, code, commands and diagrams.
- **Measurements:** Cost, latency, reliability, complexity and security.
- **Result:** What happened?
- **Trade-offs:** What became easier or harder?
- **Decision:** Keep, reject or defer.
- **Follow-up:** ADR or backlog updates required.

## 13. Completion definition

An item is complete only when:
1. The concept has been explained in project documentation.
2. A practical implementation or experiment exists.
3. The result has been validated.
4. Trade-offs and cost/operational impact are recorded.
5. A decision is made about whether the experiment changes the product baseline.

This checklist is intentionally long-lived. It should evolve as the product and learning goals evolve.
