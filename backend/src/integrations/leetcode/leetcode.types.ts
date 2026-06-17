export interface LCUserProfile {
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number;
}

export interface LCContestInfo {
  rating: number;
  globalRanking: number;
  attendedContestsCount: number;
}

export interface LCStatusResponse {
  connected: boolean;
  leetcodeUsername: string | null;
  leetcodeLastSync: string | null;
}

export interface LCAnalyticsResponse {
  problemDistribution: {
    easyPercentage: number;
    mediumPercentage: number;
    hardPercentage: number;
  };
  difficultyProfile: 'Advanced' | 'Intermediate' | 'Beginner';
  monthlyGrowth: number;
  weeklyAverage: number;
  goalPrediction: {
    estimatedWeeks: number;
    estimatedCompletion: string;
  } | null;
}

export interface LCInsightsResponse {
  strongestCategory: string;
  weakestCategory: string;
  progressInsight: string;
  recommendation: string;
}

export interface LCReadinessResponse {
  dsaReadiness: number;
  breakdown: {
    solvedCountScore: number;
    contestRatingScore: number;
    hardProblemsScore: number;
    consistencyScore: number;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
