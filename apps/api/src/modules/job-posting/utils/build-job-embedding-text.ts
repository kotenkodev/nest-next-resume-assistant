import type { ParsedJobRequirements } from '../schemas/parsed-job-requirements.schema';

export function buildJobEmbeddingText(
  requirements: ParsedJobRequirements,
): string {
  const sections: string[] = [];

  const roleInfo = [requirements.level, requirements.role]
    .filter(Boolean)
    .join(' ');
  if (roleInfo) {
    sections.push(`Role: ${roleInfo}`);
  }

  if (requirements.experienceYears !== null) {
    sections.push(
      `Required Experience: ${requirements.experienceYears}+ years`,
    );
  }

  if (requirements.requiredSkills.length > 0) {
    sections.push(`Required Skills: ${requirements.requiredSkills.join(', ')}`);
  }

  if (requirements.preferredSkills.length > 0) {
    sections.push(
      `Preferred Skills: ${requirements.preferredSkills.join(', ')}`,
    );
  }

  if (requirements.responsibilities.length > 0) {
    sections.push(
      `Key Responsibilities:\n${requirements.responsibilities.join('\n')}`,
    );
  }

  const text = sections.join('\n\n').trim();

  if (!text) {
    throw new Error('Job requirements have no content to embed');
  }

  return text;
}
