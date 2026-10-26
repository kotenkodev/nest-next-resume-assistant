import type {
  DocumentStatus,
  FileUploadPayload,
  ParsedProfile,
  UploadInitiationResponse,
} from '@repo/shared';
import { request } from './client';

export interface ResumeItem {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: DocumentStatus;
  rawText: string | null;
  parsedProfile?: ParsedProfile;
  createdAt: string;
  updatedAt: string;
}

export const resumesApi = {
  list: () => request<ResumeItem[]>('/api/resumes'),
  get: (id: string) => request<ResumeItem>(`/api/resumes/${id}`),
  initiateUpload: (dto: FileUploadPayload) =>
    request<UploadInitiationResponse>('/api/resumes', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  completeUpload: (id: string) =>
    request<{ id: string; processingJobId: string }>(
      `/api/resumes/${id}/complete`,
      { method: 'POST' },
    ),
  delete: (id: string) =>
    request<void>(`/api/resumes/${id}`, { method: 'DELETE' }),
};
