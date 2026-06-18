export interface GHUserInfo {
  login: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GHRepository {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
  created_at: string;
  fork: boolean;
  topics: string[];
}

export interface GHEvent {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    size?: number;
    commits?: { message: string; distinct: boolean }[];
    action?: string;
    ref?: string;
    ref_type?: string;
  };
}

export interface GHProfileResponse {
  username: string;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface GHRepositorySummary {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  lastPushed: string;
  isActive: boolean;
  score: number;
}

export interface GHActivityResponse {
  activeProjects: number;
  commitsLast30Days: number;
  activeDays: number;
  totalStars: number;
  totalForks: number;
}

export interface GHAnalyticsResponse {
  projectReadiness: number;
  breakdown: {
    projectCountScore: number;
    projectActivityScore: number;
    commitConsistencyScore: number;
    repositoryQualityScore: number;
  };
  topProjects: { name: string; score: number }[];
}

export interface GHStatusResponse {
  connected: boolean;
  githubUsername: string | null;
  githubLastSync: string | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
