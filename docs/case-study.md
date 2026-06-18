# ProgressOS — Case Study

> Engineering students track progress across LeetCode, Codeforces, GitHub, and personal projects — but nothing connects them. ProgressOS unifies it all into a single operating system.

---

## Problem

Engineering students preparing for placements face a fragmented tracking problem:

- **LeetCode** for DSA practice — but no visibility into long-term trends
- **Codeforces** for contest rating — but isolated from other progress
- **GitHub** for project work — but no connection to career readiness
- **Notion / Excel / sticky notes** for goals — but easily abandoned

The result: students have **data everywhere, insight nowhere**. They can't answer "Am I actually improving?" or "What should I work on next?"

---

## Solution

ProgressOS is a unified engineering growth platform that:

| Problem | Solution |
|---|---|
| Fragmented tracking | Single dashboard aggregating all platforms |
| No career visibility | Market Readiness score with 5 weighted components |
| No direction | AI Coach with weekly insights and ROI-ranked actions |
| No accountability | Streaks, XP, levels, and auto-generated weekly reviews |
| Hard to share | Public profile at `/u/:username` and printable progress report |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│    HTML + Tailwind CDN (no build step needed)        │
│    Clerk Auth ── js/auth.js                          │
│    apiRequest wrapper with retry logic                │
└──────────────┬──────────────────────────────────────┘
               │  REST API (JSON)
┌──────────────▼──────────────────────────────────────┐
│                    Backend                           │
│    Express 5 (TypeScript)                            │
│    Zod validators — all API inputs validated         │
│    Rate limiting (100 req/min general, 20 auth)      │
│    Helmet + CORS + Morgan logging                    │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│                    Services                          │
│    Market Readiness Engine (5-component scoring)     │
│    AI Coach (rule-based insights engine)             │
│    Weekly Review Generator                           │
│    Unified Timeline (activity + GitHub + LC + CF)    │
│    Portfolio Analytics (6-month XP, categories, goals)│
│    Achievements (20 badges, on-the-fly computation)   │
│    Public Profile + Resume Export                     │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│                  Integrations                        │
│    LeetCode (unofficial GraphQL API)                 │
│    Codeforces (public REST API + caching)            │
│    GitHub (REST API with token auth)                 │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│                  Database                            │
│    PostgreSQL (Neon serverless)                      │
│    Prisma ORM with adapter-pg                        │
│    Models: User, Activity, Goal, Integration data nodes │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + Tailwind CSS CDN + Clerk JS |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL (Neon) + Prisma 7 |
| Auth | Clerk (with dev fallback for localhost) |
| Deployment | Vercel (serverless) + Neon (serverless Postgres) |

---

## Key Design Decisions

### 1. Dynamic Metrics Registry

Instead of hardcoding 15 separate tracker schemas, each tracker is registered through a factory:

```typescript
app.use('/api/trackers/leetcode', createTrackerRouter('leetCodeEntry'));
```

This lets us add new trackers (NPTEL, GATE, AIML, Cyber, Research, etc.) in **one line** without writing new controllers or services.

### 2. Market Readiness Engine

A weighted scoring model that evaluates students across 5 dimensions:

| Component | Weight | Source |
|---|---|---|
| DSA | 30% | LeetCode solved + Codeforces rating + contest history |
| Projects | 25% | GitHub repos, commits, project activities |
| Core CS | 20% | Academic entries, subject-wise tracking |
| Open Source | 15% | PRs, contributions, open-source activities |
| Research | 10% | Research papers, NPTEL, publications |

Each component computes a 0–100 score with specific reasons and a recommended action.

### 3. On-the-fly Achievements

Achievements are computed from database state rather than stored in a model:

```typescript
const checks: Record<string, boolean> = {
  streak_7: user.longestStreak >= 7,
  leetcode_100: leetCodeSolved >= 100,
  // ... 18 more checks
};
```

This avoids schema migrations, stale unlock states, and redundant storage. New achievements just need a check function.

### 4. Rule-based AI Coach (not ML)

The AI Coach is deterministic — it analyzes:
- Current streak vs. longest streak
- This week's XP vs. last week's XP
- LeetCode solved growth
- Codeforces rating trajectory
- GitHub commit activity

It generates insights (streak warnings, growth flags, achievement alerts) and ranks ROI actions by effort level (quick win / focused / long-term).

---

## Challenges

### Codeforces API Caching

The Codeforces API is notoriously slow and rate-limited. We cache profile data with a 30-second TTL to avoid hammering their endpoints on every page load:

```typescript
const CACHE_TTL = 30_000; // 30 seconds
```

### LeetCode GraphQL

LeetCode has no official public API. We reverse-engineered their internal GraphQL endpoint (`https://leetcode.com/graphql`) with specific query shapes for user profile, contest history, and submission stats. This is fragile but works.

### Dynamic Metrics Registry

The generic tracker factory needed to handle 12+ different metric types with different schemas while maintaining type safety. We used Prisma's dynamic model access with a registry pattern.

### Market Readiness Calculation

Computing a meaningful 0–100 score from heterogeneous data (LeetCode solves, GitHub commits, CF rating, activity logs) required careful normalization and weight tuning. Each component has its own scoring function:

```typescript
// DSA component scoring
const dsaScore = Math.min(
  (leetCodeSolved / 500) * 0.5 +
  (cfRating / 2000) * 0.3 +
  (dsaActivityScore / 100) * 0.2,
  100
);
```

---

## Results

### Before ProgressOS

- 5+ browser tabs open to check progress
- No unified view of career readiness
- Goals set and forgotten within a week
- No accountability or streaks

### After ProgressOS

- **Single dashboard** replacing 5+ platforms
- **Market Readiness score** quantifying career prep
- **AI Coach** providing weekly direction
- **Streaks and XP** making tracking addictive
- **Weekly reviews** enabling data-driven reflection
- **Public profiles** for portfolio sharing

---

## Screenshots

*[Screenshots would be included here]*

- Dashboard overview with hero cards, market readiness, and activity feed
- Analytics page with XP growth chart, category breakdown, LeetCode history
- Public profile page at /u/:username
- Printable progress report

---

## Lessons Learned

1. **Empty states matter more than features.** Users judge your product in the first 5 seconds. If they see zeros and "Loading..." text, they leave.

2. **Demo data is a portfolio multiplier.** Recruiters won't create accounts. A seeded demo user with realistic stats (CF 1540, LC 458, MR 88) makes the product immediately impressive.

3. **Rule-based insights > no insights.** You don't need ML to be useful. Deterministic analysis of streaks, trends, and platform data provides genuine value.

4. **Integration reliability > integration breadth.** Three reliable integrations (LC, CF, GH) are better than ten flaky ones. Each integration requires ongoing maintenance.

5. **Print-to-PDF > server PDF generation.** For the resume/report feature, `window.print()` with CSS `@media print` rules avoided Puppeteer dependencies, server memory costs, and generation delays.

---

## Future: CareerOS

The next evolution is **CareerOS** — where Market Readiness becomes a full career intelligence engine:

- Real-time job market alignment scores
- Skill gap analysis against target companies
- Personalized learning path generation
- Interview readiness prediction
- Recruiter-facing profile page

But first, ProgressOS needs to prove people want to use it every day.

---

> Built by [Your Name] — 2026
