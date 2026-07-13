export interface ResumeContextProfile {
  fullName: string | null;
  professionalTitle: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  portfolio: string | null;
}

export interface ResumeContextPhoto {
  url: string;
  thumbnailUrl: string | null;
}

export interface ResumeContextProject {
  id: string;
  title: string;
  description: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  bullets: string[];
}

export interface ResumeContextCertificate {
  id: string;
  name: string;
  issuer: string | null;
  credentialUrl: string | null;
}

export interface ResumeContextAchievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  source: string | null;
}

export interface ResumeContextEducation {
  institution: string;
  cgpa: number | null;
  creditsEarned: number | null;
  creditsRequired: number | null;
  attendance: number | null;
}

export interface ResumeContextCodingProfileStats {
  totalSolved?: number;
  contestRating?: number;
  rating?: number;
  repoCount?: number;
  stars?: number;
  commits?: number;
}

export interface ResumeContextCodingProfile {
  platform: 'github' | 'leetcode' | 'codeforces';
  label: string;
  url: string | null;
  username: string | null;
  enabled: boolean;
  stats?: ResumeContextCodingProfileStats;
}

export interface ResumeContextMetadata {
  version: number;
  generatedAt: string;
  profileName: string;
  targetRole: string;
  completion: number;
  includedProjectIds: string[];
  includedCertificateIds: string[];
  includedAchievementKeys: string[];
}

export interface ResumeContextWarnings {
  critical: string[];
  suggestions: string[];
}

export interface ResumeContextComputed {
  skills: string[];
  projectCount: number;
  skillCount: number;
}

export interface ResumeContextMissing {
  fields: string[];
}

export interface ResumeContextSections {
  profile: ResumeContextProfile;
  photo: ResumeContextPhoto | null;
  projects: ResumeContextProject[];
  skills: string[];
  certificates: ResumeContextCertificate[];
  achievements: ResumeContextAchievement[];
  education: ResumeContextEducation | null;
  codingProfiles: ResumeContextCodingProfile[];
}

export interface ResumeContext {
  metadata: ResumeContextMetadata;
  sections: ResumeContextSections;
  sectionOrder: string[];
  visibility: Record<string, boolean>;
  sectionLabels: Record<string, string>;
  computed: ResumeContextComputed;
  warnings: ResumeContextWarnings;
  missing: ResumeContextMissing;
  stats: Record<string, number>;
}
