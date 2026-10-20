# EcoMate Backend — Agile Sprint Tracker

**Scope:** Backend only (MongoDB/Express in `backend/`), aligned to SRS v3.0.
**Stack of record:** Node.js + Express + **Mongoose/MongoDB** + Socket.io (+ Redis as of Sprint 5).
**Owner:** Kareen (backend). Shalom & Charles consume the API contracts noted per sprint.
**How to use:** Update `Status` per task (⬜ Not Started · 🔄 In Progress · ✅ Done · 🚧 Blocked) at each standup. Sprints are ~1 week; nothing carries over two sprints without a blocker note.

---

## Stage Summary (current position)

| Sprint | Theme | Status | Target |
|---|---|---|---|
| 0 | Marketplace core port (MarketX) | ✅ **DONE** | shipped |
| 1 | Roles & Auth hardening | ⬜ Not Started | next up |
| 2 | Pickup Tracking + trust stack | ⬜ Not Started | |
| 3 | Real-time layer (Chat + feed events) | ⬜ Not Started | |
| 4 | Challenge review workflow + role guards | ⬜ Not Started | |
| 5 | Scan history + AI integration hardening | ⬜ Not Started | |
| 6 | Redis (cache, rate-limit, queues, socket scale) | ⬜ Not Started | |
| 7 | Price transparency + analytics endpoints | ⬜ Not Started | |
| 8 | Security hardening & validation | ⬜ Not Started | |
| 9 | Testing & seed data | ⬜ Not Started | |
| 10 | Deployment prep | ⬜ Not Started | |

> **We are here: ➡️ Sprint 1.** Everything in Sprint 0 is committed and mounted in `server.js`.

---

## Sprint 0 — Marketplace core ✅ (DONE)

Already shipped and verified (`node --check` + require-graph + server boot):

- ✅ Listings (material + artwork, fixed + auction) — `listingModel`, `/api/listings`
- ✅ Orders + escrow lifecycle (pay → ship → deliver → release/cancel) — `orderModel`, `/api/orders`
- ✅ Disputes (OPEN → UNDER_REVIEW → RESOLVED, refund/release) — `/api/disputes`
- ✅ Reviews & ratings — `/api/reviews`
- ✅ In-app notifications service — `/api/notifications`
- ✅ Challenges (join, proof submissions pending/approved/rejected) — `/api/challenges`
- ✅ Personal weekly goals — `/api/goals`
- ✅ Community feed (no self-like/bookmark) — `/api/feed`
- ✅ Impact dashboard (weight, CO₂, rank percentile, badges) — `/api/impact`
- ✅ Playground proxy → FastAPI AI service (`/api/playground/classify`)
- ✅ Eco news aggregation (`/api/news`)
- ✅ Base JWT auth (`verifyToken`), wallet + impact fields on `userModel`

---

## Sprint 1 — Roles & Auth Hardening 🔜

**Goal:** Every SRS §4 permission enforceable. Unblocks ALL later sprints.

| # | Task | Files | Status | Notes |
|---|---|---|---|---|
| 1.1 | Extend `role` enum → `['user','ngo','company','pickup_agent','admin']` + `orgType` (`ngo`\|`company`) + org fields (orgName, cacOrRegNo, mission) + agent fields (vehicleType, serviceAreas[], idDocUrl) + `verificationStatus` (`unverified`\|`pending`\|`verified`) | `models/userModel.js` | ⬜ | Migration: default existing users to `user`, existing admins stay `admin` |
| 1.2 | `requireRole(...roles)` middleware built on `verifyToken` | `middleware/authMiddleware.js` | ⬜ | 403 with clear message on mismatch |
| 1.3 | `requireVerified` middleware (org/agent must be `verified` to bid/create/pick) | same | ⬜ | |
| 1.4 | Registration: role selection + role-specific fields; JWT payload gains `role`, `verificationStatus` | `controllers/userController.js` | ⬜ | Frontend contract: `POST /api/users/register { role, orgType?, orgName?, vehicleType? }` |
| 1.5 | Admin endpoints: list pending verifications, approve/reject org & agent | `routes/userRoutes.js` | ⬜ | `PATCH /api/users/:id/verify` (admin only) |
| 1.6 | Apply SRS §4 matrix to existing routes (challenges create → org only; dispute resolve → admin; etc.) | all `routes/*.js` | ⬜ | One guard line per route |
| 1.7 | Login flow: reject unverified orgs/agents from role-gated actions (not from login) | `userController.js` | ⬜ | |

**Definition of done:** A `ngo` user can create a challenge; a `user` cannot (403). An unverified agent cannot accept pickups. Admin can approve an org and it gains powers immediately.
**API contract for Shalom/Charles:** register/login responses gain `role`, `verificationStatus`; role picker on signup screen.

---

## Sprint 2 — Pickup Tracking + Trust Stack ⭐ (flagship — answers primary research)

**Goal:** SRS §7.1 lifecycle **+ trust controls for the "untrusted driver" problem**: PIN handover, photo proof, agent ratings, live status.

| # | Task | Files | Status | Notes |
|---|---|---|---|---|
| 2.1 | `pickupModel` — status enum `REQUESTED→ASSIGNED→IN_TRANSIT→DELIVERED` (+`CANCELLED`); fields: requester, agent, items[], linkedOrder/listing, address + lat/lng, timeWindow, `timeline[]` (status, actor, timestamp, note), `pinHash`, `handoverPhotoUrl`, `deliveryConfirmedBy`, `agentRating`, `ratingComment` | `models/pickupModel.js` (new) | ⬜ | Timeline array is what renders the SRS §8.6 view |
| 2.2 | Reconcile legacy `requestModel` — either upgrade it into pickups or clearly separate "material request" vs "pickup event" (document decision) | `models/requestModel.js` | ⬜ | ⚠️ Do not ship both silently |
| 2.3 | `POST /api/pickups` (schedule: user/org; agent ref optional), `GET /api/pickups` (role-scoped: requester sees own, agent sees assigned+available, admin sees all), `GET /api/pickups/:id` | `controllers/pickupController.js`, `routes/pickupRoutes.js` (new) | ⬜ | |
| 2.4 | `POST /api/pickups/:id/assign` (admin assign or agent claim) → only `verified` agents | same | ⬜ | Generates 6-digit PIN, returns hash only |
| 2.5 | `PATCH /api/pickups/:id/status` (ASSIGNED→IN_TRANSIT→DELIVERED) with valid-transition guard | same | ⬜ | Rejects illegal jumps (e.g. REQUESTED→DELIVERED) |
| 2.6 | **Trust stack:** `POST /api/pickups/:id/deliver` requires correct PIN + handover photo (multer); DELIVERED only final when requester confirms; `POST /api/pickups/:id/rate` (1–5, requester→agent, once) writes agent `avgRating`/`pickupCount` | same + `services/pickupService.js` | ⬜ | ⭐ This is the viva differentiator |
| 2.7 | Socket.io event `pickup:status` push on every transition (reuse auction io instance) | `server.js` / socket setup | ⬜ | No polling |
| 2.8 | Link won auctions/orders → pickup creation (company workflow §9.2) | `orderController.js` | ⬜ | |

**Definition of done:** Full happy path demoable: schedule → assign (agent sees PIN request) → IN_TRANSIT live push → photo + PIN delivery → requester confirms → rate agent. Illegal transitions 409.
**API contract:** `GET /api/pickups/mine`, `/api/pickups/available` (agent), status badges per SRS §8.6.

---

## Sprint 3 — Real-time Layer (Chat + Feed events) ⚡

**Goal:** SRS §5.3 over **Socket.io** (already a dependency — replaces raw WebSocket from the SRS; same events, less infra).

| # | Task | Files | Status | Notes |
|---|---|---|---|---|
| 3.1 | Socket bootstrap in `server.js` (`http` server + `io`), JWT handshake auth (token in handshake, reject unauthenticated sockets) | `server.js`, `sockets/index.js` (new) | ⬜ | |
| 3.2 | `conversationModel` (participants[], lastMessageAt) + `chatMessageModel` (conversation, sender, content, readBy[]) | `models/` (new ×2) | ⬜ | Current `Message` model = contact form only — untouched |
| 3.3 | REST fallback: `GET /api/conversations`, `GET /api/conversations/:id/messages` (cursor pagination) | `routes/chatRoutes.js` (new) | ⬜ | Mobile-friendly initial load |
| 3.4 | WS events `message:send` → persist + emit `message:new` to room; `typing:start/stop`; read receipts | `sockets/chatHandlers.js` (new) | ⬜ | Per SRS §5.3 table |
| 3.5 | Feed events: emit `feed:notification` (like/comment/post) from existing feed controller; guard: never emit to actor for own post | `feedImpactController.js` | ⬜ | |
| 3.6 | Notification WS push (reuse `notificationService`) | `services/notificationService.js` | ⬜ | |

**Definition of done:** Two browsers: send message → instant receive + typing indicator. Like a post → author's other tab gets a feed:notification (not for self-likes).
**Note (SRS deviation, document it):** GraphQL feed deferred — REST + WS covers the real-time requirement at ~10% of the infra cost. Revisit as stretch.

---

## Sprint 4 — Challenge Review Workflow + Rewards 🏆

| # | Task | Files | Status | Notes |
|---|---|---|---|---|
| 4.1 | Guard: challenge creation = org/admin only; participants cannot submit twice/day limits if needed | `challengeRoutes.js` | ⬜ | |
| 4.2 | `PATCH /api/challenges/:id/submissions/:subId/review` — creator-org or admin only; approve/reject + reviewer note; on approve: progress += weight, reward issued | `challengeGoalController.js` | ⬜ | |
| 4.3 | Reward issuance service: badge → `user.badges[]`; certificate → generated PDF/URL; cash → wallet credit (test mode); voucher → code | `services/rewardService.js` (new) | ⬜ | ⚠️ CASH fulfilment remains "manual/test" per SRS §10 open item |
| 4.4 | Challenge types mapping: Quantity/Action/Community → existing `targetType`/`category` (document mapping) | model/docs | ⬜ | |

**Definition of done:** NGO approves a proof submission → user's progress + badge + notification update atomically.

---

## Sprint 5 — Scan History + AI Integration 🤖

**Goal:** Your existing AI service (recyclable-only upload validation) gets full platform integration + audit trail.

| # | Task | Files | Status | Notes |
|---|---|---|---|---|
| 5.1 | `scanHistoryModel` — user, predictedMaterial, confidence, imageUrl, artworkScan (bool), listedItemId (nullable) | `models/scanHistoryModel.js` (new) | ⬜ | SRS §6 table; fuel for your results chapter |
| 5.2 | `POST /api/scan` — auth'd proxy to AI service (same FastAPI `/classify`), logs to scan history, returns `{ material, confidence, suggestedCategory, estimatedPriceRange }` | `controllers/scanController.js` (new) | ⬜ | Playground endpoint stays public/demo; `/api/scan` is the real one |
| 5.3 | **Recyclable-only enforcement:** listing creation with `imageVerification` required — non-recyclable uploads rejected by AI check before insert | `listingController.js` | ⬜ | Your AI service already validates; wire it as a pre-save gate |
| 5.4 | Artwork scans allowed (predictedMaterial nullable per SRS) | same | ⬜ | |
| 5.5 | GET `/api/scan/history` (own), admin stats endpoint (top predicted materials) | same | ⬜ | |

**Definition of done:** Listing a non-recyclable photo → 422 with reason. Every scan (playground excluded) lands in history.

---

## Sprint 6 — Redis Integration 🔴

**Goal:** Introduce Redis as supporting service. Adopt in this order (each independently valuable):

| # | Task | Tech | Status | Notes |
|---|---|---|---|---|
| 6.1 | Client wrapper w/ env config (`REDIS_URL`), graceful fallback to memory when absent | `config/redis.js` (new), `ioredis` | ⬜ | Keeps dev boxes working without Redis |
| 6.2 | **Rate limiting** on auth + scan + bid endpoints (sliding window) | `express-rate-limit` + `rate-limiter-flexible` | ⬜ | Login brute-force protection |
| 6.3 | **Cache:** news feed (5 min TTL), active listings (60 s TTL), challenge list | `services/cacheService.js` | ⬜ | Invalidate on write |
| 6.4 | **Job queue:** auction close + challenge deadline sweeps via cron → queue workers (replaces in-process `node-cron` fragility) | `bullmq` | ⬜ | Survives restarts, retry-safe |
| 6.5 | **Socket.io Redis adapter** (pub/sub) so WS works across processes | `@socket.io/redis-adapter` | ⬜ | Only needed >1 instance |
| 6.6 | **Token blacklist** for logout / password-change invalidation | redis SETEX | ⬜ | JWTs are stateless today |

**Definition of done:** 100 login attempts in a minute → 429. Auction closes reliably via queue even if server restarted mid-auction.

---

## Sprint 7 — Price Transparency + Analytics 📊

*Addresses research gap: "price volatility" / price discovery.*

| # | Task | Files | Status | Notes |
|---|---|---|---|---|
| 7.1 | `GET /api/market/prices` — avg sold ₦/kg per category, 7/30-day trend (aggregation pipeline over orders) | `controllers/marketController.js` (new) | ⬜ | Shown on marketplace cards |
| 7.2 | Seller transparency: verified badge, avgRating, completed-sales count on listing responses | `listingController.js` | ⬜ | Answers "inability to verify suppliers" |
| 7.3 | Admin analytics: GMV, active pickups, top categories, challenge completion rate | `routes/impactRoutes.js` or new `adminRoutes` | ⬜ | Admin dashboard data |

---

## Sprint 8 — Security Hardening 🔒

| # | Task | Status | Notes |
|---|---|---|---|
| 8.1 | `express-validator` on every write endpoint (already a dependency — unused) | ⬜ | |
| 8.2 | Helmet, strict CORS, request size limits | ⬜ | |
| 8.3 | Upload hardening: mime + magic-byte check, per-type size caps, random filenames (playground pattern) on all multer configs | ⬜ | |
| 8.4 | Ownership guards audit: every `PATCH/DELETE` verifies `req.user` owns the resource (or is admin) | ⬜ | Highest-severity class of bug |
| 8.5 | Error handling: global error middleware, no stack traces in prod responses | ⬜ | |

---

## Sprint 9 — Testing & Seed Data 🧪

| # | Task | Status | Notes |
|---|---|---|---|
| 9.1 | Test harness: Jest + Supertest + mongodb-memory-server | ⬜ | |
| 9.2 | Unit tests: escrow transitions, dispute resolution, pickup state machine, CO₂ calc | ⬜ | State machines first — highest regression risk |
| 9.3 | API tests: auth matrix per role (403 cases are the point) | ⬜ | |
| 9.4 | Seed script: users per role, listings, a full pickup, a dispute | ⬜ | `backend/seed.js` + `documentation/seed.md` update |

---

## Sprint 10 — Deployment Prep 🚀

| # | Task | Status | Notes |
|---|---|---|---|
| 10.1 | MongoDB Atlas provisioning + network rules | ⬜ | |
| 10.2 | Env matrix (`MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `FASTAPI_CLASSIFIER_URL`, `NEWSAPI_KEY`, `GNEWS_API_KEY`) — sandbox vs prod | ⬜ | |
| 10.3 | Dockerfile + docker-compose (api, mongo, redis) for parity | ⬜ | |
| 10.4 | Health/readiness endpoint (`/api/health`: db + redis + ai ping) | ⬜ | Reuse pattern from `news-server.js` |
| 10.5 | Deploy backend (Azure per team plan) + smoke-test suite | ⬜ | |

---

## Backlog / Explicitly Deferred (per SRS §10 + scope agreement)

- ⏸ **GraphQL feed layer** — deferred; REST + Socket.io chosen (document deviation + rationale in report)
- ⏸ **OPay integration** — test-mode only or wallet-escrow retained; needs merchant account
- ⏸ **CASH/VOUCHER reward logistics** — manual/test mode
- ⏸ **Live GPS tracking of agents** — design note: status events first; continuous GPS is a privacy + battery problem
- ⏸ **Recycling-centre map** (research gap "poor discovery of recycling centres") — cheap win, Leaflet already installed; candidate for a fast-follow after Sprint 4

---

## Service Inventory (what talks to what)

| Service | Used for | Status |
|---|---|---|
| **MongoDB** (Mongoose) | System of record — 15+ models | ✅ wired |
| **FastAPI AI service** (yours) | Recyclable-only upload validation + classification | ✅ built by Kareen; wired via `FASTAPI_CLASSIFIER_URL` |
| **Redis** | Rate limit, cache, BullMQ queues, socket adapter, token blacklist | 🔜 Sprint 6 |
| **Socket.io** | Auctions (live), chat, pickup status, feed notifications | ⚠️ auctions only today; Sprints 2–3 extend |
| **Nodemailer** | Email notifications (challenge rewards, verification) | ⚠️ exists; wire into Sprint 4 |
| **NewsAPI + GNews** | Eco news feed | ✅ wired |
| **OPay** | Payments | ⏸ deferred (wallet escrow in place) |
