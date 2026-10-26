import type { FitAnalysisOutput } from '@repo/shared';
import { request } from './client';
import type { JobItem } from './jobs';
import type { ResumeItem } from './resumes';

export interface FitAnalysisItem {
  id: string;
  userId: string;
  resumeId: string;
  jobPostingId: string;
  matchScore: number;
  skillGaps: FitAnalysisOutput['skillGaps'];
  experienceAlignment: FitAnalysisOutput['experienceAlignment'];
  interviewPrep: FitAnalysisOutput['interviewPrep'];
  createdAt: string;
  updatedAt: string;
  jobPosting?: JobItem;
  resume?: ResumeItem;
}

export const analysisApi = {
  run: (resumeId: string, jobPostingId: string) =>
    request<FitAnalysisItem>('/api/analysis', {
      method: 'POST',
      body: JSON.stringify({ resumeId, jobPostingId }),
    }),
  get: (resumeId: string, jobPostingId: string) =>
    request<FitAnalysisItem | null>(
      `/api/analysis?resumeId=${resumeId}&jobPostingId=${jobPostingId}`,
    ),
  listForResume: (resumeId: string) =>
    request<FitAnalysisItem[]>(`/api/analysis/resume/${resumeId}`),
};
