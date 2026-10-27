'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analysisApi, chatApi, jobsApi, resumesApi } from '@/api';
import { useWorkspaceStore } from '@/store/workspace';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import {
  SparklesIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
  BriefcaseIcon,
  Building2Icon,
  AwardIcon,
  TrendingUpIcon,
  MessageSquareCodeIcon,
  FileQuestionIcon,
  LayersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FitAnalysisViewProps {
  conversationId?: string;
}

export default function FitAnalysisView({ conversationId }: FitAnalysisViewProps) {
  const queryClient = useQueryClient();
  const { selectedResumeId: storeResumeId, selectedJobIds: storeJobIds } =
    useWorkspaceStore();

  // 1. Fetch conversation details (to get active resumeId and jobPostingIds)
  const { data: conversation, isLoading: isConvoLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatApi.getConversation(conversationId!),
    enabled: !!conversationId,
  });

  const resumeId = conversation?.resumeId || storeResumeId;
  const jobPostingIds = conversation?.jobPostingIds || storeJobIds;

  // Active job selector (if multiple jobs are in context)
  const [activeJobId, setActiveJobId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (jobPostingIds && jobPostingIds.length > 0 && !activeJobId) {
      setActiveJobId(jobPostingIds[0] || null);
    }
  }, [jobPostingIds, activeJobId]);

  // 2. Fetch the Resume and Active Job details for header info
  const { data: activeJob } = useQuery({
    queryKey: ['job', activeJobId],
    queryFn: () => jobsApi.get(activeJobId!),
    enabled: !!activeJobId,
  });

  const { data: resume } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumesApi.get(resumeId!),
    enabled: !!resumeId,
  });

  // 3. Fetch Fit Analysis for (resumeId, activeJobId)
  const {
    data: analysis,
    isLoading: isAnalysisLoading,
    isError: isAnalysisError,
  } = useQuery({
    queryKey: ['fit-analysis', resumeId, activeJobId],
    queryFn: () => analysisApi.get(resumeId!, activeJobId!),
    enabled: !!resumeId && !!activeJobId,
  });

  // 4. Run Fit Analysis Mutation
  const { mutate: runAnalysis, isPending: isRunning } = useMutation({
    mutationFn: () => analysisApi.run(resumeId!, activeJobId!),
    onSuccess: (newAnalysis) => {
      queryClient.setQueryData(
        ['fit-analysis', resumeId, activeJobId],
        newAnalysis,
      );
      toast.success('Fit analysis calculated successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to compute fit analysis');
    },
  });

  // Empty / Guard State: No resume or job selected
  if (!resumeId || !activeJobId || jobPostingIds.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <LayersIcon className="size-12 mb-3 opacity-25" />
        <h3 className="text-base font-semibold text-foreground">
          No Job Context Selected
        </h3>
        <p className="mt-1 text-xs max-w-sm">
          Please select a candidate resume and at least one job posting from the
          right sidebar to perform a pairwise fit evaluation.
        </p>
      </div>
    );
  }

  const jobTitle =
    activeJob?.title || activeJob?.parsedData?.role || 'Job Posting';
  const company = activeJob?.company || 'Company';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Job Switcher Tabs (if conversation has multiple jobs) */}
      {jobPostingIds.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b">
          <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">
            Evaluate against:
          </span>
          {jobPostingIds.map((jId, idx) => {
            const isCurrent = jId === activeJobId;
            return (
              <button
                key={jId}
                onClick={() => setActiveJobId(jId)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer',
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Job #{idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Header Banner: Candidate -> Job target */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">
              {resume?.parsedProfile?.name || resume?.fileName || 'Candidate'}
            </span>
            <span>→</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Building2Icon className="size-3.5" />
              {company}
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {jobTitle}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pairwise fit calculation, gap breakdown, and STAR interview
            preparation
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => runAnalysis()}
            disabled={isRunning}
            className="gap-2 cursor-pointer shadow-xs text-xs font-medium"
          >
            {isRunning ? (
              <RefreshCwIcon className="size-3.5 animate-spin" />
            ) : analysis ? (
              <RefreshCwIcon className="size-3.5" />
            ) : (
              <SparklesIcon className="size-3.5" />
            )}
            {isRunning
              ? 'Analyzing...'
              : analysis
                ? 'Re-calculate Fit'
                : 'Run AI Fit Analysis'}
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isAnalysisLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      ) : !analysis ? (
        /* Empty State: Analysis not yet calculated for this pair */
        <div className="p-12 text-center rounded-2xl border border-dashed bg-muted/20">
          <SparklesIcon className="size-10 mx-auto text-primary/40 mb-3" />
          <h3 className="font-semibold text-foreground text-sm">
            Fit Analysis Not Generated Yet
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Click &quot;Run AI Fit Analysis&quot; above to run the LLM evaluation
            pipeline. It will compute an overall match score, detect required and
            preferred skill gaps, map experience, and generate interview
            talking points.
          </p>
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* 1. Score Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Match Score */}
            <div className="p-5 rounded-2xl border bg-card shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Overall Match Score
              </span>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-extrabold text-foreground">
                  {analysis.matchScore}%
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    analysis.matchScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : analysis.matchScore >= 60
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {analysis.matchScore >= 80
                    ? 'Strong Fit'
                    : analysis.matchScore >= 60
                      ? 'Moderate Fit'
                      : 'Skill Gap Warning'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    analysis.matchScore >= 80
                      ? 'bg-emerald-500'
                      : analysis.matchScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-destructive',
                  )}
                  style={{ width: `${analysis.matchScore}%` }}
                />
              </div>
            </div>

            {/* Experience Alignment Score */}
            <div className="p-5 rounded-2xl border bg-card shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Experience Alignment
              </span>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-extrabold text-foreground">
                  {analysis.experienceAlignment.score}%
                </span>
                <TrendingUpIcon className="size-4 text-primary" />
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${analysis.experienceAlignment.score}%` }}
                />
              </div>
            </div>

            {/* Quick Skills Summary */}
            <div className="p-5 rounded-2xl border bg-card shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Skills Matched vs Missing
              </span>
              <div className="flex items-center justify-between my-2">
                <div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {analysis.skillGaps.matchedSkills.length}
                  </span>
                  <p className="text-[10px] text-muted-foreground">Matched</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-destructive">
                    {analysis.skillGaps.missingRequired.length}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Req. Missing
                  </p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-amber-500">
                    {analysis.skillGaps.missingPreferred.length}
                  </span>
                  <p className="text-[10px] text-muted-foreground">Pref. Gap</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Based on structured requirement analysis
              </p>
            </div>
          </div>

          {/* 2. Skill Gaps Breakdown */}
          <div className="p-5 rounded-2xl border bg-card shadow-2xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <AwardIcon className="size-4 text-primary" />
              Skill Gap & Alignment Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl bg-muted/30 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2.5">
                  <CheckCircle2Icon className="size-4" />
                  Matched Skills ({analysis.skillGaps.matchedSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skillGaps.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                  {analysis.skillGaps.matchedSkills.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No matching skills found
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Required Skills */}
              <div className="p-4 rounded-xl bg-muted/30 border border-destructive/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-2.5">
                  <XCircleIcon className="size-4" />
                  Missing Required (
                  {analysis.skillGaps.missingRequired.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skillGaps.missingRequired.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20"
                    >
                      {skill}
                    </span>
                  ))}
                  {analysis.skillGaps.missingRequired.length === 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      All required skills met!
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Preferred Skills */}
              <div className="p-4 rounded-xl bg-muted/30 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2.5">
                  <AlertCircleIcon className="size-4" />
                  Missing Preferred (
                  {analysis.skillGaps.missingPreferred.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skillGaps.missingPreferred.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                  {analysis.skillGaps.missingPreferred.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      None identified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Experience Alignment & Mapping Table */}
          <div className="p-5 rounded-2xl border bg-card shadow-2xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <BriefcaseIcon className="size-4 text-primary" />
              Experience Alignment & Requirement Mapping
            </h3>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20">
                <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  Key Strengths
                </h4>
                <ul className="space-y-1.5">
                  {analysis.experienceAlignment.strengths.map((str, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground/90 flex items-start gap-2"
                    >
                      <CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/20">
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  Alignment Concerns
                </h4>
                <ul className="space-y-1.5">
                  {analysis.experienceAlignment.concerns.map((con, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground/90 flex items-start gap-2"
                    >
                      <AlertCircleIcon className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Requirement Mapping Table */}
            {analysis.experienceAlignment.mapping?.length > 0 && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
                    <tr>
                      <th className="p-3 w-2/5">Job Requirement</th>
                      <th className="p-3 w-2/5">Matching Candidate Experience</th>
                      <th className="p-3 w-1/5 text-center">Fit Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {analysis.experienceAlignment.mapping.map((map, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="p-3 font-medium text-foreground">
                          {map.jobRequirement}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {map.matchingExperience || 'No direct experience found'}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={cn(
                              'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold',
                              map.fitLevel === 'HIGH'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : map.fitLevel === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : 'bg-destructive/10 text-destructive',
                            )}
                          >
                            {map.fitLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Interview Preparation (STAR Guidance & Technical Talking Points) */}
          <div className="p-5 rounded-2xl border bg-card shadow-2xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <FileQuestionIcon className="size-4 text-primary" />
              Tailored Interview Questions & STAR Guidance
            </h3>

            {/* Technical Questions */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Technical Questions (Targeting Skill Gaps)
              </h4>
              {analysis.interviewPrep.technicalQuestions.map((tq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-muted/20 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-xs text-foreground">
                      {i + 1}. {tq.question}
                    </p>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                      Tests: {tq.targetGap}
                    </span>
                  </div>

                  <div className="pl-4 border-l-2 border-primary/40 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Suggested Talking Points:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-foreground/80 space-y-0.5">
                      {tq.talkingPoints.map((tp, idx) => (
                        <li key={idx}>{tp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Behavioral Questions */}
            <div className="space-y-3 pt-3 border-t">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Behavioral STAR Questions
              </h4>
              {analysis.interviewPrep.behavioralQuestions.map((bq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-muted/20 space-y-2"
                >
                  <p className="font-medium text-xs text-foreground">
                    {i + 1}. {bq.question}
                  </p>
                  <div className="p-3 rounded-lg bg-background border text-[11px] text-muted-foreground space-y-1">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquareCodeIcon className="size-3.5 text-primary" />
                      STAR Strategy:
                    </span>
                    <p className="leading-relaxed">{bq.starGuidance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
