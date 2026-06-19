/**
 * Raw Codeforces User Info structure from API (user.info)
 */
export interface CFUserInfo {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

/**
 * Raw Codeforces Rating Change structure from API (user.rating)
 */
export interface CFUserRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

/**
 * Raw Codeforces API envelope wrapper
 */
export interface CFApiResponse<T> {
  status: 'OK' | 'FAILED';
  comment?: string;
  result: T;
}

/**
 * Custom formatted response for GET /api/codeforces/profile
 */
export interface CFProfileResponse {
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  avatar: string;
  handle: string;
}

/**
 * Custom formatted response for GET /api/codeforces/rating-history
 */
export interface CFRatingHistoryResponse {
  contest: string;
  rating: number;
  change: number;
  date: string; // ISO date string of update
}

/**
 * Custom formatted response for GET /api/codeforces/status
 */
export interface CFStatusResponse {
  connected: boolean;
  codeforcesHandle: string | null;
  codeforcesLastSync: string | null; // ISO date string of last sync
}

/**
 * In-memory Cache Entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number; // Unix timestamp in ms
}

/**
 * Raw Codeforces Problem structure inside submissions
 */
export interface CFProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: 'PROGRAMMING' | 'QUESTION';
  points?: number;
  rating?: number;
  tags: string[];
}

/**
 * Raw Codeforces Party structure inside submissions
 */
export interface CFParty {
  contestId?: number;
  members: { handle: string; name?: string }[];
  participantType: 'CONTESTANT' | 'PRACTICE' | 'VIRTUAL' | 'OUT_OF_COMPETITION';
  ghost: boolean;
  room?: number;
  startTimeSeconds?: number;
}

/**
 * Raw Codeforces Submission structure from API (user.status)
 */
export interface CFSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CFProblem;
  author: CFParty;
  programmingLanguage: string;
  verdict?: 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'CHALLENGED' | 'SKIPPED' | 'TESTING' | 'REJECTED';
  passTestCount: number;
}

/**
 * Custom formatted structure for a recent solved problem
 */
export interface CFRecentSolve {
  problemName: string;
  index: string;
  rating?: number;
  contestId?: number;
  solvedAt: string; // ISO date string
}

/**
 * Custom formatted response for GET /api/codeforces/analytics
 */
export interface CFAnalyticsResponse {
  solvedCount: number;
  difficultyDistribution: Record<number, number>;
  strongestBucket: string;
  acceptanceRate: number;
  recentActivity: CFRecentSolve[];
  daysSinceLast1700Solve: number | null;
  estimatedContestsToExpert: number | string | null;
  dsaScore: number;
}

/**
 * Raw Codeforces Blog Entry from API (inside recentActions)
 */
export interface CFBlogEntry {
  id: number;
  originalLocale: string;
  creationTimeSeconds: number;
  authorHandle: string;
  title: string;
  content: string;
  tags: string[];
  rating: number;
  locale: string;
  modifiedTimeSeconds: number;
  allowViewHistory: boolean;
}

/**
 * Raw Codeforces Recent Action from API (recentActions)
 */
export interface CFRecentAction {
  timeSeconds: number;
  blogEntry?: CFBlogEntry;
  comment?: {
    id: number;
    creationTimeSeconds: number;
    commentatorHandle: string;
    locale: string;
    text: string;
    parentCommentId?: number;
    rating: number;
  };
}

/**
 * Custom formatted response for GET /api/codeforces/recent-blog-posts
 */
export interface CFBlogPostResponse {
  id: number;
  title: string;
  authorHandle: string;
  creationTimeSeconds: number;
  tags: string[];
  rating: number;
  url: string;
}
