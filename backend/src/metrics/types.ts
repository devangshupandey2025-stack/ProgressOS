import { TrackerSource } from '@prisma/client';

export interface MetricResult {
  current: number;
  remaining?: number;
  progressPercentage?: number;
  recommendation?: string;
}

export type MetricHandler = (userId: string, target?: number) => Promise<MetricResult>;
