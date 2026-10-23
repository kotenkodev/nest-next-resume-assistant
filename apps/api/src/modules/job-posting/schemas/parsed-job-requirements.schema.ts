import { z } from 'zod';

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
