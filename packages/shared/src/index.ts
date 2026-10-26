import { z } from 'zod';

export const APP_NAME = 'Resume Assistant';

export interface HealthResponse {
  status: 'ok';
  app: string;
}

// ---------------------------------------------------------------------------
// Document & Ingestion
// ---------------------------------------------------------------------------

export type DocumentStatus =
  | 'PENDING_UPLOAD'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export interface FileUploadPayload {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface UploadInitiationResponse {
  id: string;
  uploadUrl: string;
}

// ---------------------------------------------------------------------------
// Resume & Profile Schemas
// ---------------------------------------------------------------------------

export const parsedProfileSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  summary: z.string().nullable(),
  skills: z.object({
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    tools: z.array(z.string()),
    softSkills: z.array(z.string()),
  }),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      year: z.string().nullable(),
    }),
  ),
});

export type ParsedProfile = z.infer<typeof parsedProfileSchema>;
export const jsonParsedProfileSchema = z.toJSONSchema(parsedProfileSchema);

// ---------------------------------------------------------------------------
// Job Posting Schemas
// ---------------------------------------------------------------------------

export const parsedJobRequirementsSchema = z.object({
  role: z.string().nullable(),
  level: z.string().nullable(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  experienceYears: z.number().nonnegative().nullable(),
});

export type ParsedJobRequirements = z.infer<typeof parsedJobRequirementsSchema>;
export const jsonParsedJobRequirementsSchema = z.toJSONSchema(
  parsedJobRequirementsSchema,
);

// ---------------------------------------------------------------------------
// Fit Analysis Schemas & Contracts
// ---------------------------------------------------------------------------

export const skillGapResultSchema = z.object({
  matchedSkills: z.array(z.string()),
  missingRequired: z.array(z.string()),
  missingPreferred: z.array(z.string()),
});
export type SkillGapResult = z.infer<typeof skillGapResultSchema>;

export const experienceAlignmentResultSchema = z.object({
  score: z.number(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  mapping: z.array(
    z.object({
      jobRequirement: z.string(),
      matchingExperience: z.string(),
      fitLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    }),
  ),
});
export type ExperienceAlignmentResult = z.infer<
  typeof experienceAlignmentResultSchema
>;

export const interviewPrepResultSchema = z.object({
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      targetGap: z.string(),
      talkingPoints: z.array(z.string()),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      starGuidance: z.string(),
    }),
  ),
});
export type InterviewPrepResult = z.infer<typeof interviewPrepResultSchema>;

export const fitAnalysisOutputSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  skillGaps: skillGapResultSchema,
  experienceAlignment: experienceAlignmentResultSchema,
  interviewPrep: interviewPrepResultSchema,
});
export type FitAnalysisOutput = z.infer<typeof fitAnalysisOutputSchema>;
export const jsonFitAnalysisOutputSchema = z.toJSONSchema(
  fitAnalysisOutputSchema,
);

// ---------------------------------------------------------------------------
// Chat & Conversation Contracts
// ---------------------------------------------------------------------------

export interface CreateConversationPayload {
  resumeId: string;
  jobPostingIds: string[];
  title?: string;
}

export interface SendMessagePayload {
  message: string;
}

export interface ConversationDto {
  id: string;
  userId: string;
  resumeId: string;
  jobPostingIds: string[];
  title?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string | Date;
}

export interface StreamChatChunk {
  content?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Semantic Matching Contract
// ---------------------------------------------------------------------------

export interface JobMatchResult<TJob = unknown> {
  job: TJob;
  similarityScore: number;
}
