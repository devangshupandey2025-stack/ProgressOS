export interface VITStatusResponse {
  connected: boolean;
  vitUsername: string | null;
  vitLastSync: string | null;
}

export interface VITProfileResponse {
  cgpa: number;
  creditsEarned: number;
  creditsRequired: number;
  attendance: number;
}

export interface VITAnalyticsResponse {
  cgpa: number;
  creditsProgress: number;
  attendance: number;
  academicReadiness: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
