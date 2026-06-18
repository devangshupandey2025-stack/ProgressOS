import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { clerkMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// ─── Global Middleware ───────────────────────────────────────────────────────

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Clerk middleware — must be applied before any route that uses requireAuth
app.use(clerkMiddleware());

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── API Routes ──────────────────────────────────────────────────────────────


import activityRoutes from './routes/activity.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import goalRoutes from './routes/goal.routes.js';
import codeforcesIntegrationRoutes from './integrations/codeforces/codeforces.routes.js';
import leetcodeIntegrationRoutes from './integrations/leetcode/leetcode.routes.js';
import githubIntegrationRoutes from './integrations/github/github.routes.js';
import marketReadinessRoutes from './routes/market-readiness.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import weeklyReviewRoutes from './routes/weekly-review.routes.js';
import timelineRoutes from './routes/timeline.routes.js';
import { createTrackerRouter } from './utils/trackerFactory.js';



app.use('/api/user', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/codeforces', codeforcesIntegrationRoutes);
app.use('/api/leetcode', leetcodeIntegrationRoutes);
app.use('/api/github', githubIntegrationRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/market-readiness', marketReadinessRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/weekly-review', weeklyReviewRoutes);
app.use('/api/timeline', timelineRoutes);

// Register Tracker Routes using the Generic Factory
app.use('/api/trackers/leetcode', createTrackerRouter('leetCodeEntry'));
app.use('/api/trackers/codeforces', createTrackerRouter('codeforcesEntry'));
app.use('/api/trackers/cgpa', createTrackerRouter('cGPAEntry'));
app.use('/api/trackers/subjects', createTrackerRouter('subjectEntry'));
app.use('/api/trackers/projects', createTrackerRouter('projectEntry'));
app.use('/api/trackers/opensource', createTrackerRouter('openSourceEntry'));
app.use('/api/trackers/corecs', createTrackerRouter('coreCSEntry'));
app.use('/api/trackers/nptel', createTrackerRouter('nPTELEntry'));
app.use('/api/trackers/aiml', createTrackerRouter('aIMLEntry'));
app.use('/api/trackers/cyber', createTrackerRouter('cyberEntry'));
app.use('/api/trackers/gate', createTrackerRouter('gATEEntry'));
app.use('/api/trackers/research', createTrackerRouter('researchEntry'));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../../')));

// ─── 404 Catch-All ───────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use(errorHandler);

// Only start listening when running as a standalone server (not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`
    🚀 ProgressOS Backend is running!
    ────────────────────────────────────
    📡 Port:        ${env.PORT}
    🌍 Environment: ${env.NODE_ENV}
    🕐 Started at:  ${new Date().toISOString()}
    ────────────────────────────────────
    `);
  });
}

export default app;

// Trigger restart for prisma client

