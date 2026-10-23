import type { ParsedProfile } from '../schemas/parsed-profile.schema';

export function buildResumeEmbeddingText(profile: ParsedProfile): string {
  const sections: string[] = [];

  if (profile.summary) {
    sections.push(`Summary: ${profile.summary}`);
  }

  const skillGroups = [
    ['Programming languages', profile.skills.languages],
    ['Frameworks', profile.skills.frameworks],
    ['Tools', profile.skills.tools],
    ['Soft skills', profile.skills.softSkills],
  ] as const;

  for (const [label, skills] of skillGroups) {
    if (skills.length > 0) {
      sections.push(`${label}: ${skills.join(', ')}`);
    }
  }

  for (const experience of profile.experience) {
    const role = [experience.title, experience.company]
      .filter(Boolean)
      .join(' at ');

    const dates = [experience.startDate, experience.endDate]
      .filter(Boolean)
      .join(' – ');

    sections.push(
      [`Experience: ${role}`, dates, ...experience.highlights]
        .filter(Boolean)
        .join('\n'),
    );
  }

  for (const education of profile.education) {
    const details = [
      education.degree,
      education.institution,
      education.year,
    ].filter(Boolean);

    if (details.length > 0) {
      sections.push(`Education: ${details.join(', ')}`);
    }
  }

  const text = sections.join('\n\n').trim();

  if (!text) {
    throw new Error('Resume has no career information to embed');
  }

  return text;
}
