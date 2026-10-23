import { z } from 'zod';

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
