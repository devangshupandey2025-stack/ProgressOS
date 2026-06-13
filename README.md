# ProgressOS

> Track Effort. Measure Growth. Build Consistency.

ProgressOS is a personal engineering growth operating system designed for students and developers who want to systematically track their learning, projects, competitive programming, and career progress.

Instead of managing tasks, ProgressOS focuses on measuring growth over time through activity tracking, XP, streaks, and analytics.

---

# Vision

Most productivity tools answer:

> "What do I need to do?"

ProgressOS answers:

> "Am I becoming a better engineer?"

The platform helps users monitor and improve across multiple domains:

* Competitive Programming
* Software Development
* Machine Learning
* Cybersecurity
* Academics
* Open Source

---

# MVP Goals

The MVP is focused on solving four core problems:

1. What did I accomplish today?
2. Am I staying consistent?
3. How much progress am I making?
4. Which areas need more attention?

---

# Tech Stack

## Frontend

* Vanilla JavaScript
* HTML5
* Tailwind CSS
* Clerk (Authentication)

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* PostgreSQL (Neon)
* Prisma ORM

## Deployment

* Backend → Render (Planned)
* Database → Neon PostgreSQL

---

# Core Features

## Authentication

Powered by Clerk.

### Features

* Email Authentication
* Social Authentication (future-ready)
* Protected Routes
* Session Management
* User Management

---

## Dynamic Tracker System

The backend utilizes a generic `trackerFactory` to automatically generate API endpoints for any custom activity tracking category, such as:

* LeetCode & Codeforces
* CGPA & Subject scores
* Projects & Open Source
* Machine Learning, Cyber, and Research

## Daily Activity Logging

Users can record work performed each day. Activities automatically feed into the XP and Growth engines.

### Categories

* DSA
* Projects
* Machine Learning
* Cybersecurity
* Academics
* Open Source

### Example Activities

```text
DSA → Solved 3 LeetCode Medium Problems

Project → Implemented Authentication Module

ML → Learned Logistic Regression

Cybersecurity → Completed TryHackMe Room
```

---

## XP System

Every activity contributes toward total XP, calculated dynamically in the backend.

### XP Allocation

| Category         | XP / Hour |
| ---------------- | --------- |
| DSA              | 10        |
| Projects         | 20        |
| Machine Learning | 15        |
| Cybersecurity    | 15        |
| Academics        | 10        |
| Open Source      | 25        |

---

## Level System

```text
Level = floor(totalXP / 1000) + 1
```

### Example

| XP   | Level |
| ---- | ----- |
| 0    | 1     |
| 1000 | 2     |
| 5000 | 6     |
| 10000| 11    |

---

## Streak Tracking

Track consistency through:

* Current Streak
* Longest Streak

### Rules

* Activity logged today → streak continues
* Miss a day → streak resets

---

## Dashboard

### Overview Cards

* Total XP
* Current Level
* Current Streak
* Longest Streak
* Market Readiness Score

### Analytics

* Weekly XP
* Real-time XP Velocity Graph
* Skill Distribution Ring Chart

---

# Project Structure

```text
progressos/

├── index.html            # Main Dashboard UI
├── trackers/             # Frontend Tracker Pages
├── js/                   # Frontend Logic
│
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints (users, activities, trackers)
│   │   ├── controllers/
│   │   ├── middleware/   # Auth (Clerk), Error Handling, Validation
│   │   ├── services/
│   │   ├── utils/        # Generic Tracker Factory
│   │   └── prisma/       # Schema & Migrations
│
└── docs/
```

---

# Development Roadmap

## Phase 1 — Foundation (✅ Completed)

* Repository Setup
* Vanilla UI Foundation
* Express + TypeScript
* PostgreSQL (Neon)
* Prisma
* Clerk Integration

## Phase 2 — User Management (✅ Completed)

* Clerk Authentication
* Protected Routes
* User Synchronization with Database

## Phase 3 — Activity Tracking (✅ Completed)

* Tracker Factory Architecture
* Daily Logs API
* Activity Creation
* CRUD Operations

## Phase 4 — Progress Engine (✅ Completed)

* Dynamic XP Calculation
* Level System Engine
* Dynamic Dashboard Data Wiring

## Phase 5 — Dashboard (✅ Completed)

* Real-time XP Charts
* Realistic Skill Distribution
* Market Readiness Score
* Activity Heatmap Prep

## Phase 6 — UI Polish (In Progress)

* Dark Mode
* Toast Notifications
* Loading States

## Phase 7 — Deployment (Planned)

* Frontend → Vercel
* Backend → Render
* Database → Neon PostgreSQL

---

# Future Scope

## Version 2

* Weekly Reviews
* Achievement System
* Heatmaps Completion
* Goal Tracking
* Career Score

## Version 3

* LeetCode Integration
* Codeforces Integration
* GitHub Integration
* Resume Analyzer
* Placement Readiness Predictor

---

# Long-Term Goal

ProgressOS aims to become a complete engineering growth platform that helps developers transform consistent effort into measurable progress.

Build Daily.

Improve Weekly.

Compound Yearly.
