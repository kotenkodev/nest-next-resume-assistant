import { z } from 'zod';

export const skillGapResult = z.object({
  matchedSkills: z.array(z.string()),
  missingRequired: z.array(z.string()),
  missingPreferred: z.array(z.string()),
});

export const interviewPrepResult = z.object({
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

export const experienceAlignmentResult = z.object({
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

export type SkillGapResult = z.infer<typeof skillGapResult>;
export type InterviewPrepResult = z.infer<typeof interviewPrepResult>;
export type ExperienceAlignmentResult = z.infer<
  typeof experienceAlignmentResult
>;

export const jsonSkillGapResultSchema = z.toJSONSchema(skillGapResult);

export const jsonExperienceAlignmentResultSchema = z.toJSONSchema(
  experienceAlignmentResult,
);

export const jsonInterviewPrepResultSchema =
  z.toJSONSchema(interviewPrepResult);

export const fitAnalysisOutputSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  skillGaps: skillGapResult,
  experienceAlignment: experienceAlignmentResult,
  interviewPrep: interviewPrepResult,
});
export type FitAnalysisOutput = z.infer<typeof fitAnalysisOutputSchema>;
export const jsonFitAnalysisOutputSchema = z.toJSONSchema(
  fitAnalysisOutputSchema,
);
