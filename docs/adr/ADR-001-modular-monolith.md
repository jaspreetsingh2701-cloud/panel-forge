---
title: Modular monolith for initial platform
status: Proposed
date: 2026-11-10
---

# ADR-001: Modular monolith for the initial platform

## Context
PanelForge is early-stage, built by a small team, and requires coordinated tenancy, metadata, records, permissions and publishing. Microservices would add deployment and network complexity before scale justifies it.

## Proposed decision
Use one Next.js web app, one NestJS API and PostgreSQL. Keep domain modules and shared packages behind explicit interfaces. Add a worker/service only when a concrete workload warrants it.

## Alternatives
- Microservices from day one: excessive MVP operational overhead.
- Unstructured monolith: weak boundaries and maintainability.
- Per-feature serverless functions: added distributed data and local-development complexity.

## Consequences
Faster development and simpler transactions; modules cannot scale independently initially, and disciplined boundaries are required.

## Status
Proposed pending architecture review.

## References
- [System architecture](../01-architecture/system-architecture.md)
