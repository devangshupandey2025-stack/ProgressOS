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

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* Clerk

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Clerk Authentication

## Deployment

* Frontend → Vercel
* Backend → Render
* Database → Neon PostgreSQL

---

# Core MVP Features

## Authentication

Powered by Clerk.

### Features

* Email Authentication
* Social Authentication (future-ready)
* Protected Routes
* Session Management
* User Management

---

## Daily Activity Logging

Users can record work performed each day.

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

Every activity contributes toward total XP.

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
Level = floor(totalXP / 100) + 1
```

### Example

| XP   | Level |
| ---- | ----- |
| 0    | 1     |
| 100  | 2     |
| 500  | 6     |
| 1000 | 11    |

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

### Analytics

* Weekly XP
* Weekly Activity Count
* Study Hours

### Charts

* XP Over Time
* Category Distribution

---

## Activity History

Users can:

* View previous logs
* Review activities
* Analyze consistency
* Track growth over time

---

# Database Schema

## User

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  logs       DailyLog[]
  streak     Streak?
}
```

---

## DailyLog

```prisma
model DailyLog {
  id        String     @id @default(cuid())
  date      DateTime
  notes     String?
  totalXP   Int        @default(0)

  userId    String
  user      User       @relation(fields: [userId], references: [id])

  activities Activity[]

  createdAt DateTime @default(now())
}
```

---

## Activity

```prisma
model Activity {
  id         String   @id @default(cuid())
  category   String
  title      String
  hours      Float
  xp         Int

  dailyLogId String
  dailyLog   DailyLog @relation(fields: [dailyLogId], references: [id])

  createdAt  DateTime @default(now())
}
```

---

## Streak

```prisma
model Streak {
  id             String @id @default(cuid())

  currentStreak  Int @default(0)
  longestStreak  Int @default(0)

  userId         String @unique
  user           User @relation(fields: [userId], references: [id])
}
```

---

# API Endpoints

## Authentication

Authentication is handled by Clerk.

Backend verifies Clerk sessions before granting access to protected resources.

---

## Daily Logs

```http
POST   /api/logs
GET    /api/logs
GET    /api/logs/:id
DELETE /api/logs/:id
```

---

## Activities

```http
POST   /api/activity
PUT    /api/activity/:id
DELETE /api/activity/:id
```

---

## Dashboard

```http
GET /api/dashboard
```

Example Response:

```json
{
  "totalXP": 1320,
  "level": 14,
  "currentStreak": 12,
  "longestStreak": 21,
  "weeklyActivities": 28
}
```

---

# Project Structure

```text
progressos/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── context/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── prisma/
│
└── docs/
```

---

# Development Roadmap

## Phase 1 — Foundation

* Repository Setup
* React + Vite
* Express + TypeScript
* PostgreSQL
* Prisma
* Clerk Integration

## Phase 2 — User Management

* Clerk Authentication
* Protected Routes
* User Synchronization

## Phase 3 — Activity Tracking

* Daily Logs
* Activity Creation
* CRUD Operations

## Phase 4 — Progress Engine

* XP Calculation
* Level System
* Streak Tracking

## Phase 5 — Dashboard

* Statistics
* Analytics APIs
* Charts

## Phase 6 — UI Polish

* Responsive Design
* Dark Mode
* Loading States
* Toast Notifications

## Phase 7 — Deployment

* Vercel
* Render
* Neon PostgreSQL

---

# Future Scope

## Version 2

* Weekly Reviews
* Achievement System
* Heatmaps
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
