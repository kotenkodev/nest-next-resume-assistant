import type {
  DocumentStatus,
  FileUploadPayload,
  ParsedJobRequirements,
  UploadInitiationResponse,
} from '@repo/shared';
import { request } from './client';

export interface JobItem {
  id: string;
  userId: string;
  title: string | null;
  company?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: DocumentStatus;
  rawText: string | null;
  parsedData?: ParsedJobRequirements;
  createdAt: string;
  updatedAt: string;
}

export const jobsApi = {
  list: () => request<JobItem[]>('/api/jobs'),
  get: (id: string) => request<JobItem>(`/api/jobs/${id}`),
  initiateUpload: (dto: FileUploadPayload) =>
    request<UploadInitiationResponse>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  completeUpload: (id: string) =>
    request<{ id: string; processingJobId: string }>(
      `/api/jobs/${id}/complete`,
      { method: 'POST' },
    ),
  delete: (id: string) =>
    request<void>(`/api/jobs/${id}`, { method: 'DELETE' }),
  match: (resumeId: string, limit = 5) =>
    request<Array<{ job: JobItem; similarityScore: number }>>(
      `/api/jobs/match?resumeId=${resumeId}&limit=${limit}`,
    ),
};
