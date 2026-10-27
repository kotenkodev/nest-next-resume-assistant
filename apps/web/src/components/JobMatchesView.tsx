'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, jobsApi, resumesApi } from '@/api';
import { useWorkspaceStore } from '@/store/workspace';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import {
  SparklesIcon,
  BriefcaseIcon,
  Building2Icon,
  CheckCircle2Icon,
  RefreshCwIcon,
  FileTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  CheckIcon,
  PlusIcon,
  AlertCircleIcon,
  LayersIcon,
  GraduationCapIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface JobMatchesViewProps {
  conversationId?: string;
  resumeId?: string;
}

export default function JobMatchesView({
  conversationId,
  resumeId: propResumeId,
}: JobMatchesViewProps) {
  const queryClient = useQueryClient();
  const {
    selectedResumeId: storeResumeId,
    selectedJobIds,
    setSelectedJobIds,
    setSelectedResumeId,
  } = useWorkspaceStore();

  const [limit, setLimit] = React.useState<number>(5);
  const [expandedJobIds, setExpandedJobIds] = React.useState<Set<string>>(
    new Set(),
  );

  // 1. Derive active conversation
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatApi.getConversation(conversationId!),
    enabled: !!conversationId && !propResumeId,
  });

  const effectiveJobIds = React.useMemo(() => {
    return conversation?.jobPostingIds ?? selectedJobIds;
  }, [conversation?.jobPostingIds, selectedJobIds]);

  // Mutation to persist job postings to conversation in DB
  const { mutate: updateConvoJobs } = useMutation({
    mutationFn: (newJobIds: string[]) =>
      chatApi.updateConversation(conversationId!, { jobPostingIds: newJobIds }),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ['conversation', conversationId],
        (prev: any) =>
          prev
            ? {
                ...prev,
                jobPostingIds: updated.jobPostingIds,
              }
            : prev,
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update conversation jobs');
    },
  });

  const handleToggleFitJob = (jobId: string, title: string) => {
    const isCurrentlySelected = effectiveJobIds.includes(jobId);
    const nextJobIds = isCurrentlySelected
      ? effectiveJobIds.filter((id) => id !== jobId)
      : [...effectiveJobIds, jobId];

    // 1. Update client Zustand store
    setSelectedJobIds(nextJobIds);

    // 2. Persist to active conversation in PostgreSQL if inside a conversation
    if (conversationId) {
      updateConvoJobs(nextJobIds);
    }

    if (!isCurrentlySelected) {
      toast.success(`Selected "${title}" for Fit Analysis`);
    } else {
      toast.info(`Removed "${title}" from Fit Analysis`);
    }
  };

  const activeResumeId =
    propResumeId || conversation?.resumeId || storeResumeId;

  // 2. Fetch active resume details
  const { data: resume, isLoading: isResumeLoading } = useQuery({
    queryKey: ['resume', activeResumeId],
    queryFn: () => resumesApi.get(activeResumeId!),
    enabled: !!activeResumeId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PROCESSING' || status === 'PENDING_UPLOAD'
        ? 2000
        : false;
    },
  });

  // 3. Fallback list of resumes if none is selected
  const { data: allResumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumesApi.list(),
    enabled: !activeResumeId,
  });

  // 4. Fetch semantic matches
  const {
    data: matches,
    isLoading: isMatchesLoading,
    isFetching: isMatchesFetching,
    refetch: refetchMatches,
    isError: isMatchesError,
    error: matchesError,
  } = useQuery({
    queryKey: ['job-matches', activeResumeId, limit],
    queryFn: () => jobsApi.match(activeResumeId!, limit),
    enabled: !!activeResumeId && resume?.status === 'READY',
  });

  // Candidate skills set for instant matching highlight
  const candidateSkills = React.useMemo(() => {
    const set = new Set<string>();
    if (!resume?.parsedProfile?.skills) return set;
    const { languages, frameworks, tools, softSkills } =
      resume.parsedProfile.skills;
    [...languages, ...frameworks, ...tools, ...softSkills].forEach((s) => {
      set.add(s.toLowerCase().trim());
    });
    return set;
  }, [resume]);

  const toggleExpand = (id: string) => {
    setExpandedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Empty State: No Resume Selected
  // ---------------------------------------------------------------------------
  if (!activeResumeId) {
    const readyResumes = allResumes?.filter((r) => r.status === 'READY') || [];

    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
          <BriefcaseIcon className="size-7" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Find Matching Job Postings
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Select a candidate resume to evaluate semantic vector similarity
          against all uploaded job postings using pgvector cosine distance.
        </p>

        {readyResumes.length > 0 && (
          <div className="mt-6 w-full text-left">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Quick Select a Candidate Resume:
            </p>
            <div className="flex flex-col gap-2">
              {readyResumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileTextIcon className="size-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {r.parsedProfile?.name || r.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.parsedProfile?.experience?.[0]?.title ||
                          'Resume Profile'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Resume Processing State
  // ---------------------------------------------------------------------------
  if (isResumeLoading || resume?.status === 'PROCESSING') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <Loader2Icon className="size-10 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold text-foreground">
          Processing Candidate Profile
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Generating 1024-dimension vector embeddings for semantic matching.
          This takes just a few seconds...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card/50 backdrop-blur shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <SparklesIcon className="size-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground truncate">
                Semantic Job Matches
              </h2>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                pgvector cosine
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              Ranked against{' '}
              <span className="font-semibold text-foreground">
                {resume?.parsedProfile?.name || resume?.fileName}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5 text-xs">
            <span className="px-2 text-muted-foreground font-medium text-[11px]">
              Top
            </span>
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                  limit === n
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {n}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchMatches()}
            disabled={isMatchesFetching}
            className="gap-1.5"
          >
            <RefreshCwIcon
              className={cn('size-3.5', isMatchesFetching && 'animate-spin')}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {isMatchesLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border bg-card space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isMatchesError && (
        <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircleIcon className="size-8 text-destructive mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-foreground">
            Failed to Calculate Job Matches
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {matchesError instanceof Error
              ? matchesError.message
              : 'An unexpected error occurred while matching vector embeddings.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchMatches()}
            className="mt-4 gap-1.5"
          >
            <RefreshCwIcon className="size-3.5" />
            Retry
          </Button>
        </div>
      )}

      {!isMatchesLoading &&
        !isMatchesError &&
        matches &&
        matches.length === 0 && (
          <div className="p-10 rounded-2xl border border-dashed border-border text-center">
            <BriefcaseIcon className="size-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h4 className="font-semibold text-sm text-foreground">
              No Matching Job Postings Found
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Upload job descriptions from the right sidebar to start comparing
              candidate profiles with semantic matching.
            </p>
          </div>
        )}

      {!isMatchesLoading && matches && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map(({ job, similarityScore }, index) => {
            const isSelected = effectiveJobIds.includes(job.id);
            const isExpanded = expandedJobIds.has(job.id);
            const percentage = Math.max(
              0,
              Math.min(100, Math.round(similarityScore * 100)),
            );

            const title = job.parsedData?.role || job.title || job.fileName;
            const company = job.company || 'Direct Employer';
            const level = job.parsedData?.level;
            const experienceYears = job.parsedData?.experienceYears;
            const requiredSkills = job.parsedData?.requiredSkills || [];
            const preferredSkills = job.parsedData?.preferredSkills || [];
            const responsibilities = job.parsedData?.responsibilities || [];

            // Tier styling based on similarity
            const isHighFit = percentage >= 75;
            const isMediumFit = percentage >= 50 && percentage < 75;

            const scoreBadgeClass = isHighFit
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : isMediumFit
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-muted text-muted-foreground border-border';

            const scoreBarClass = isHighFit
              ? 'bg-emerald-500'
              : isMediumFit
                ? 'bg-amber-500'
                : 'bg-muted-foreground';

            return (
              <div
                key={job.id}
                className={cn(
                  'rounded-2xl border transition-all duration-200 bg-card overflow-hidden',
                  isSelected
                    ? 'border-primary shadow-sm ring-1 ring-primary/20'
                    : 'border-border hover:border-border/80 hover:shadow-xs',
                )}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate">
                          {title}
                        </h3>
                        {level && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                            {level}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building2Icon className="size-3.5 text-muted-foreground" />
                          {company}
                        </span>
                        {experienceYears !== null &&
                          experienceYears !== undefined && (
                            <span className="flex items-center gap-1">
                              <BriefcaseIcon className="size-3.5" />
                              {experienceYears}+ yrs required
                            </span>
                          )}
                        <span className="text-[11px]">
                          Added {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">
                            {percentage}%
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase font-medium">
                            Similarity
                          </div>
                        </div>
                        <div
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5',
                            scoreBadgeClass,
                          )}
                        >
                          <SparklesIcon className="size-3" />
                          <span>
                            {isHighFit
                              ? 'Strong Match'
                              : isMediumFit
                                ? 'Good Fit'
                                : 'Moderate'}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => handleToggleFitJob(job.id, title)}
                        className="gap-1.5 h-8 text-xs font-semibold"
                      >
                        {isSelected ? (
                          <>
                            <CheckIcon className="size-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <PlusIcon className="size-3.5" />
                            <span>Select for Fit</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        scoreBarClass,
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {requiredSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                        Key Skills:
                      </span>
                      {requiredSkills.slice(0, 8).map((skill, i) => {
                        const isMatched = candidateSkills.has(
                          skill.toLowerCase().trim(),
                        );
                        return (
                          <span
                            key={i}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors',
                              isMatched
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-muted/50 text-foreground border-border',
                            )}
                          >
                            {isMatched && (
                              <CheckCircle2Icon className="size-3 text-emerald-500" />
                            )}
                            {skill}
                          </span>
                        );
                      })}
                      {requiredSkills.length > 8 && (
                        <span className="text-[11px] text-muted-foreground">
                          +{requiredSkills.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {responsibilities.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-1 flex-1 pr-4">
                        {responsibilities[0]}
                      </p>
                      <button
                        onClick={() => toggleExpand(job.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>Show Less</span>
                            <ChevronUpIcon className="size-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View Details</span>
                            <ChevronDownIcon className="size-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-5 space-y-4">
                    {responsibilities.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <LayersIcon className="size-3.5 text-primary" />
                          Core Responsibilities
                        </h4>
                        <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                          {responsibilities.map((resp, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {preferredSkills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <GraduationCapIcon className="size-3.5 text-primary" />
                          Preferred Skills & Nice-to-haves
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {preferredSkills.map((skill, idx) => {
                            const isMatched = candidateSkills.has(
                              skill.toLowerCase().trim(),
                            );
                            return (
                              <span
                                key={idx}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border',
                                  isMatched
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-muted/60 text-muted-foreground border-border',
                                )}
                              >
                                {isMatched && (
                                  <CheckCircle2Icon className="size-3 text-emerald-500" />
                                )}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
