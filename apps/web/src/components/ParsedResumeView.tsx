'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatApi, resumesApi } from '@/api';
import { useWorkspaceStore } from '@/store/workspace';
import { Skeleton } from './ui/skeleton';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  SparklesIcon,
  FileTextIcon,
  Code2Icon,
  WrenchIcon,
  HeartHandshakeIcon,
  Loader2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ParsedResumeViewProps {
  conversationId?: string;
  resumeId?: string;
}

export default function ParsedResumeView({
  conversationId,
  resumeId: propResumeId,
}: ParsedResumeViewProps) {
  const storeResumeId = useWorkspaceStore((state) => state.selectedResumeId);
  const [showRawText, setShowRawText] = React.useState(false);

  // 1. Get conversation to derive active resumeId if needed
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatApi.getConversation(conversationId!),
    enabled: !!conversationId && !propResumeId,
  });

  const activeResumeId = propResumeId || conversation?.resumeId || storeResumeId;

  // 2. Fetch the Resume data
  const {
    data: resume,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['resume', activeResumeId],
    queryFn: () => resumesApi.get(activeResumeId!),
    enabled: !!activeResumeId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PROCESSING' || status === 'PENDING_UPLOAD' ? 2000 : false;
    },
  });

  if (!activeResumeId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <FileTextIcon className="size-12 mb-3 opacity-25" />
        <h3 className="text-base font-semibold text-foreground">
          No Resume Selected
        </h3>
        <p className="mt-1 text-xs max-w-sm">
          Select or upload a candidate resume from the right sidebar to view its
          AI-extracted structured profile.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="p-8 text-center text-destructive text-xs">
        Failed to load resume details.
      </div>
    );
  }

  const isProcessing =
    resume.status === 'PROCESSING' || resume.status === 'PENDING_UPLOAD';
  const profile = resume.parsedProfile;

  if (isProcessing) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <Loader2Icon className="size-10 text-primary animate-spin mb-3" />
        <h3 className="text-base font-semibold text-foreground">
          Parsing Resume Profile...
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The background AI pipeline is extracting text, analyzing experience,
          and organizing structured skills for{' '}
          <span className="font-medium text-foreground">{resume.fileName}</span>.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-muted-foreground text-xs max-w-md mx-auto">
        <FileTextIcon className="size-10 mx-auto opacity-30 mb-2" />
        <h3 className="font-semibold text-foreground">
          No Structured Profile Found
        </h3>
        <p className="mt-1">
          This resume has not been parsed yet or the extraction failed.
        </p>
      </div>
    );
  }

  const { name, email, phone, summary, skills, experience, education } = profile;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 1. Header Card: Candidate Identity & Contact */}
      <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <UserIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {name || resume.fileName}
              </h2>
              {experience?.[0]?.title && (
                <p className="text-xs font-medium text-muted-foreground">
                  {experience[0].title}
                  {experience[0].company ? ` at ${experience[0].company}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border text-foreground">
                <MailIcon className="size-3.5 text-primary" />
                {email}
              </span>
            )}
            {phone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border text-foreground">
                <PhoneIcon className="size-3.5 text-primary" />
                {phone}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border">
              <FileTextIcon className="size-3.5" />
              {resume.fileName}
            </span>
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
              <SparklesIcon className="size-3.5" />
              Executive Summary
            </div>
            <p className="text-xs leading-relaxed text-foreground/90">
              {summary}
            </p>
          </div>
        )}
      </div>

      {/* 2. Structured Skills Grid */}
      {skills && (
        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Code2Icon className="size-4 text-primary" />
            Skills & Competencies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Programming Languages */}
            <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Languages ({skills.languages?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.languages?.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {lang}
                  </span>
                ))}
                {!skills.languages?.length && (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>

            {/* Frameworks & Libraries */}
            <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Frameworks & Libraries ({skills.frameworks?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.frameworks?.map((fw) => (
                  <span
                    key={fw}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border"
                  >
                    {fw}
                  </span>
                ))}
                {!skills.frameworks?.length && (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>

            {/* Tools & Platforms */}
            <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <WrenchIcon className="size-3" />
                Tools, Cloud & Databases ({skills.tools?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.tools?.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground border"
                  >
                    {tool}
                  </span>
                ))}
                {!skills.tools?.length && (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshakeIcon className="size-3" />
                Leadership & Soft Skills ({skills.softSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.softSkills?.map((soft) => (
                  <span
                    key={soft}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border"
                  >
                    {soft}
                  </span>
                ))}
                {!skills.softSkills?.length && (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Work Experience */}
      {experience && experience.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <BriefcaseIcon className="size-4 text-primary" />
            Work History & Experience ({experience.length})
          </h3>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border bg-muted/15 space-y-2 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      {exp.company}
                    </p>
                  </div>

                  {(exp.startDate || exp.endDate) && (
                    <span className="text-[11px] text-muted-foreground">
                      {exp.startDate || 'Unknown'} — {exp.endDate || 'Present'}
                    </span>
                  )}
                </div>

                {exp.highlights?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-foreground/80 space-y-1 pt-1">
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="leading-relaxed">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Education */}
      {education && education.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <GraduationCapIcon className="size-4 text-primary" />
            Education ({education.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border bg-muted/15 space-y-1"
              >
                <h4 className="text-xs font-semibold text-foreground">
                  {edu.degree}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {edu.institution}
                </p>
                {edu.year && (
                  <p className="text-[11px] text-muted-foreground/80 font-mono">
                    Class of {edu.year}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Collapsible Raw Text Inspector */}
      {resume.rawText && (
        <div className="p-4 rounded-2xl border bg-card/60 text-xs">
          <button
            onClick={() => setShowRawText((prev) => !prev)}
            className="flex items-center justify-between w-full font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <FileTextIcon className="size-3.5" />
              Original Extracted Document Text ({resume.rawText.length} characters)
            </span>
            {showRawText ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </button>

          {showRawText && (
            <pre className="mt-3 p-4 rounded-xl bg-muted/50 border overflow-x-auto text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-96">
              {resume.rawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

