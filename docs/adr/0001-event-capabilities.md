# ADR 0001 — Event capabilities: same-transaction audit table in Postgres

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** c.durham
- **Supersedes:** the removed CQRS bus + Kafka scaffolding (deleted in `9503d96`; Kafka containers dropped in `e82c654`)

## Context

dharma is a NestJS + GraphQL (code-first, Apollo) + Drizzle/Postgres monolith with one
web client, deployed on a single EC2 box against external RDS (`db.t3.micro`,
`postgres:17` in dev). CI/CD is moving from GitHub Actions to self-hosted Forgejo;
hosting stays EC2 + RDS for now.

The CQRS bus and dead Kafka scaffolding were removed. Every domain mutation now flows
through exactly one service method per domain — `MemberService`, `RetreatService`,
`UserService`, `AuthService` — and that seam is the emission point for events.

Facts that constrained this decision:

- **No `db.transaction()` exists anywhere in the codebase.** Every multi-statement
  operation is a bare sequence, including the refresh-token rotation in
  `auth.service.ts` (revoke then mint, non-atomic).
- **No audit, event, outbox, or log table exists.** All tables share `baseColumns`
  (uuid PK, `created_at`, `updated_at`); there is no version column anywhere.
- **No tenant concept exists.** No organization/temple entity, no tenant column.
- Schema is applied via `drizzle-kit push --force` (dev, test, and the production
  migrator); there is no migration history.
- The E2E suite is 10 vitest tests against a real Postgres, no per-test truncation,
  self-owned fixtures.
- Writes outside the four services: a weekly in-process cron deleting expired refresh
  tokens, and the seed script. The REST `/verify` endpoint routes through
  `UserService.verifyEmail`, so the service seam holds.
- Operational posture: solo-operated, no pager, background-process failure could go
  unnoticed for days. This is a hard design constraint, not a shame.
- Ambition: onboard as many Buddhist monasteries and temples as possible
  (multi-tenant future). Current reality: no users, no second service, no
  observability.

## Goals, ranked

1. **Audit history / data security** — who changed what, when, from what value.
2. **Entity-level revert** — "restore member X to how it was before Tuesday's edit."
3. **Debuggability** — reconstruct what happened when something looks wrong.
4. *(deferred)* **Sync feed for future consumers** — designed as a documented escape
   hatch, not built. No concrete second consumer exists.
5. *(rejected)* **Replayable state as a mechanism; event sourcing as system of
   record** — out. See rejected tiers.

**First consumer (milestone 1 ships to it):** an admin-facing activity feed in the
existing web client — a GraphQL query over the event table rendering
"*Actor* did *X* to *Y* at *T*". Chosen because it exercises the full path
(write → store → query → render) and pressure-tests the schema against a real
reader; a table only queried by hand in SQL validates nothing.

## Decision

**Tier (a): an append-only audit/outbox table (`domain_event`) in the same RDS
Postgres, written in the same `db.transaction()` as the domain write, through a
shared `AuditService` called by the four domain services.**

### Prerequisite (milestone 0)

Wrap the ~10 mutating service methods in `db.transaction()`. This is independently
valuable (it fixes the non-atomic token rotation) and every tier sits on it. Lands
as its own reviewable change before any event table exists.

### Envelope

| Column | Type | Notes |
|---|---|---|
| `id` | `bigserial` PK | global feed order (see ordering caveat) |
| `event_type` | text | e.g. `member.updated`, `user.email_verified` |
| `aggregate_type` | text | `member` \| `retreat` \| `user` |
| `aggregate_uuid` | uuid | the entity |
| `aggregate_version` | int | `UNIQUE (aggregate_uuid, aggregate_version)` |
| `actor` | jsonb | the `Actor` union, see below |
| `payload` | jsonb | full post-state snapshot + `changedFields` list |
| `schema_version` | int | per-event-type payload version; bump on breaking change |
| `created_at` | timestamptz | default `now()` |

### Payload: full post-state snapshot

Each event carries the entity's complete state *after* the change plus a
`changedFields` list. Create events carry full state, so any historical state is
reachable as "latest snapshot ≤ T" — one indexed query, no replay. Before/after
pairs were rejected (double duplication of sensitive data for nothing the previous
event's snapshot doesn't provide); deltas were rejected (revert would require
replay-from-create, which is tier-(b) machinery).

**Hard rule: snapshots are projections, not rows.** `password`,
`verificationToken`, and token hashes never enter the event table.

### Actor: explicit parameter, compile-time enforced

```
Actor = { kind: 'user'; uuid: string }
      | { kind: 'system'; source: 'cron' | 'seed' }
```

Every mutating service method takes an `Actor` parameter; resolvers pass the
guard-validated JWT identity down, cron and seed pass a system actor.
Request-scoped context (AsyncLocalStorage) was rejected: both options source the
actor from the same auth boundary, but ALS fails **at runtime, silently, precisely
on the paths you forget** (cron, seed, future CLI/workers), yielding unattributed
audit rows — the worst failure mode an audit system has. The explicit parameter
fails at compile time, loudly, and matches this codebase's recent purge of
implicit machinery.

### Scope

Domain streams only: `member.*`, `retreat.*`, `user.*` (including email
verification). Refresh-token lifecycle and the cleanup cron emit **nothing**. A
separate security-event stream (logins, failed logins, revocations — never token
material) is a **named future unit of work**, not merged into the domain stream:
different reader, different sensitivity, different retention.

### Ordering, idempotency, concurrency

- The activity feed orders by `id DESC`. Per-entity history orders by
  `aggregate_version`.
- **Documented caveat, not solved now:** `bigserial` assignment order ≠ commit
  order under concurrent transactions. Irrelevant for in-database queries; it
  matters only for a future *tailing* consumer, which must order by
  `(aggregate_uuid, aggregate_version)` or tail with a lag window.
- `UNIQUE (aggregate_uuid, aggregate_version)` turns concurrent edits to the same
  entity into a constraint violation instead of a silent lost update, and anchors
  idempotency for any future relay. The transaction reads the current version
  before inserting — trivial at these volumes.

### Read-your-writes

A non-issue by construction: the event row and the domain row commit atomically to
the same Postgres. There is no eventual consistency anywhere in this design. The
feed is an ordinary committed-read query.

### Deletion vs. erasure

Two different acts, deliberately not collapsed:

- **Operational delete** (`remove()`): emits `<aggregate>.deleted` with a final
  snapshot; prior events are **retained**. Routine deletes do not destroy their own
  audit trail.
- **Erasure** (rights request): a distinct operation — *designed here, not built* —
  that purges an aggregate's events and leaves a PII-free tombstone.

GDPR note: sangha membership is special-category data (Art. 9 — religious belief).
With multi-temple ambition, erasure is the floor, which is why it has a named home
instead of being an accident of `DELETE CASCADE`. Because events are deletable,
the event table is **permanently disqualified as a system of record — by design**.

### Retention

Forever; no pruning machinery (a pruning daemon is exactly the silent background
process the ops posture punishes). Revisit trigger: event table exceeds ~10M rows
or storage pressure appears on RDS.

### Tenancy

No `org_uuid` now — a tenant column referencing an entity that doesn't exist is
speculative scaffolding, structurally the same disease as the excised Kafka rig.
When tenancy lands as its own unit of work touching every table, `domain_event`
gains its column in the same migration and existing events backfill to the one org.

### Revert (goal 2)

Entity-level: restore state as-of T = take the latest snapshot ≤ T for that
aggregate and apply it as an **ordinary update through the service method** — which
itself emits an event, so the revert is in the audit trail too.

**Disaster recovery is explicitly not this design.** Whole-database restore is RDS
automated backups/PITR. Dependency line: if hosting ever leaves RDS, a whole-DB
backup story (scheduled dumps/pgBackRest + a *tested* restore) must be built first;
this design does not provide one.

### Emission seam

One shared `AuditService` injected into the four domain services, called inside
each `db.transaction()` callback. Envelope construction, version bumping, snapshot
projection, and secret-field exclusion live behind that one call — it is where the
`Actor` type is enforced once, and the only file a future broker migration touches.

## Rejected tiers

### Tier (b): Postgres-first event sourcing (events as source of truth, tables as projections)

Rejected because:

1. Events are **deletable by design** (erasure), which disqualifies them as a
   source of truth before the first one is written.
2. Entity-level revert delivers ~90% of what made event sourcing attractive at
   ~10% of its cost.
3. No incident has ever required systemic time-travel or replay; the system has no
   users yet.
4. Projection rebuild tooling, upcasters, and event-store discipline are exactly
   the class of silent-failure machinery a solo/no-pager operation cannot absorb.

Reachable in principle later, but explicitly not the direction; nothing in tier (a)
is built "to keep (b) open."

### Tier (c): a broker (Kafka or lighter)

Rejected **now**, with a specific trigger condition:

> The broker becomes justified when a consumer exists **outside this app's process
> and database** — a second service, a cross-site sync between temple instances, a
> warehouse. Not at any org count or write volume: hundreds of temples at tens of
> writes/day each is a rounding error for one Postgres.

Migration path a→c, already paid for: the audit table **is** the outbox. Adding a
broker means adding a relay that tails `domain_event` and publishes. Producers,
the envelope schema, and all in-database consumers survive unchanged; the relay
orders by `(aggregate_uuid, aggregate_version)` (see ordering caveat) and uses it
as its idempotency key.

History warning, and the strongest prior in this record: dead Kafka scaffolding
for consumers that never existed was just excised from this repo. A feed with no
consumer is how it got there.

## Operational cost and what each tier forecloses

| | Tier (a) — chosen | Tier (b) | Tier (c) |
|---|---|---|---|
| New processes on the box | **none** | projection workers / rebuild tooling | broker + relay daemon |
| Failure mode | none silent — event write failure fails the mutation loudly (atomic) | projection lag/wedge, discovered late | relay/broker wedges silently for days (ruled out by ops posture) |
| RDS cost | one table + two indexes; storage rounding-error on `db.t3.micro` | full event store + projections | outbox + broker state on EC2 |
| Forecloses | event table as system of record (deliberate, via erasure) | erasure becomes hard; solo ops overloaded | nothing — but buys nothing until the trigger fires |

Accepted costs of tier (a): PII duplicated into snapshots (bounded by the erasure
design and the secret-field exclusion rule); the `bigserial` commit-order caveat
for future tailers; ~10 method signatures gain an `Actor` parameter.

## E2E test impact

The invariant "no domain write without its event" is enforced where writes are
tested: every existing mutation test gains an event assertion via a small helper
(`expectEvent(aggregateUuid, eventType)`), plus one new test for the activity-feed
GraphQL query. Fits the suite's accumulation-tolerant style — events are queried by
the fixture's own uuid. Suite grows from 10 to ~11 tests plus assertions.

## Build plan

### M0 — Transactional write seam *(own PR; prerequisite)*
Wrap the ~10 mutating service methods in `db.transaction()`; fixes the non-atomic
refresh-token rotation as a side effect. No behavior change; existing E2E stays
green. *(Housekeeping in the same PR: drop the dead `@nestjs/microservices`
dependency and the stale Kafka references in README/deploy docs/CLI parser.)*

### M1 — Event emission + first consumer *(ships something a consumer reads)*
- `domain_event` table (envelope above) via drizzle schema.
- `Actor` type; thread the explicit parameter through resolvers → services; system
  actor for cron/seed.
- `AuditService`: envelope construction, version read+bump, snapshot projection
  with secret exclusion; called inside every mutating transaction in
  `MemberService`, `RetreatService`, `UserService`.
- `activityFeed` GraphQL query (admin-guarded), ordered by `id DESC`, paginated.
- Web client: activity feed page rendering "Actor did X to Y at T".
- E2E: `expectEvent` helper wired into existing mutation tests + one feed test.
- **Definition of done: an admin loads the feed in the browser and reads a real
  entry produced by a real mutation.**

### M2 — Entity history + revert
- Per-entity history view (snapshots over time, `aggregate_version ASC`).
- Revert action: apply a chosen snapshot as an ordinary update through the service
  method — the revert emits its own event.

### Named future units of work *(deliberately unscheduled)*
- Security-event stream (logins, failures, revocations).
- Erasure operation (purge aggregate events, PII-free tombstone).
- Tenancy (org entity everywhere; `domain_event.org_uuid` in the same migration).
- Broker relay — **only when the trigger condition fires** (a consumer outside this
  process and database exists).
