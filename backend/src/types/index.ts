import { Request } from 'express';

/**
 * Extends Express Request with authenticated user information
 * set by the Clerk auth middleware.
 */
export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    sessionId: string;
  };
  /** Internal database user ID, resolved by the auth middleware */
  dbUserId?: string;
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination query params.
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * Dashboard analytics response shape.
 */
export interface DashboardData {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  weeklyXP: number;
  categoryBreakdown: Record<string, number>;
  last7DaysXP: { date: string; xp: number }[];
}
