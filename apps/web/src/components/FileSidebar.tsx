'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { Dropzone } from './Dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FilesIcon,
  FileTextIcon,
  BriefcaseIcon,
  Building2Icon,
  CheckCircle2Icon,
  Loader2Icon,
  AlertCircleIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { chatApi, jobsApi, resumesApi, type ConversationDetail } from '@/api';
import { useWorkspaceStore } from '@/store/workspace';
import { Checkbox } from './ui/checkbox';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatFileSize(bytes: number) {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2Icon className="size-3" />
        Ready
      </span>
    );
  }
  if (status === 'PROCESSING' || status === 'PENDING_UPLOAD') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Loader2Icon className="size-3 animate-spin" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
      <AlertCircleIcon className="size-3" />
      Failed
    </span>
  );
}

export function FileSidebar({
  side = 'right',
  collapsible = 'offcanvas',
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const params = useParams<{ id?: string[] }>();
  const currentConversationId = params?.id?.[0];

  const { uploadMultiple } = useDocumentUpload();
  const queryClient = useQueryClient();
  const {
    selectedResumeId,
    setSelectedResumeId,
    selectedJobIds,
    setSelectedJobIds,
  } = useWorkspaceStore();

  const {
    data: resumes,
    isLoading: isResumesLoading,
    isError: isResumesError,
  } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
    refetchInterval: (query) => {
      const isProcessing = query.state.data?.some(
        (r) => r.status === 'PROCESSING' || r.status === 'PENDING_UPLOAD',
      );
      return isProcessing ? 2000 : false;
    },
  });

  const {
    data: jobs,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
    refetchInterval: (query) => {
      const isProcessing = query.state.data?.some(
        (j) => j.status === 'PROCESSING' || j.status === 'PENDING_UPLOAD',
      );
      return isProcessing ? 2000 : false;
    },
  });

  const handleToggleJob = (jobId: string) => {
    const isCurrentlySelected = selectedJobIds.includes(jobId);
    const nextJobIds = isCurrentlySelected
      ? selectedJobIds.filter((id) => id !== jobId)
      : [...selectedJobIds, jobId];

    setSelectedJobIds(nextJobIds);

    if (currentConversationId) {
      chatApi
        .updateConversation(currentConversationId, {
          jobPostingIds: nextJobIds,
        })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ['conversation', currentConversationId],
          });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        })
        .catch(() => {
          toast.error('Failed to sync job with conversation');
        });
    }
  };

  const { mutate: deleteResume } = useMutation({
    mutationFn: resumesApi.delete,
    onSuccess: async (_, deletedId) => {
      if (selectedResumeId === deletedId) setSelectedResumeId(null);
      toast.success('Resume deleted');

      if (currentConversationId) {
        const activeConversation = queryClient.getQueryData<ConversationDetail>(
          ['conversation', currentConversationId],
        );
        if (activeConversation?.resumeId === deletedId) {
          router.push('/');
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['resumes'] }),
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({ queryKey: ['job-matches'] }),
        queryClient.invalidateQueries({ queryKey: ['fit-analyses'] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete resume');
    },
  });

  const { mutate: deleteJob } = useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: async (_, deletedId) => {
      if (selectedJobIds.includes(deletedId)) {
        setSelectedJobIds(selectedJobIds.filter((id) => id !== deletedId));
      }
      toast.success('Job posting deleted');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({ queryKey: ['conversation'] }),
        queryClient.invalidateQueries({ queryKey: ['job-matches'] }),
        queryClient.invalidateQueries({ queryKey: ['fit-analyses'] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete job posting');
    },
  });

  return (
    <Sidebar
      side={side}
      collapsible={collapsible}
      className={cn('border-l border-sidebar-border', className)}
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <FilesIcon className="size-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm text-foreground">
                Documents & Files
              </span>
              <span className="text-[11px] text-muted-foreground">
                Manage candidate resumes & jobs
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <Tabs defaultValue="resumes" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="resumes" className="text-xs">
              Resumes {resumes?.length ? `(${resumes.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="job-postings" className="text-xs">
              Jobs {jobs?.length ? `(${jobs.length})` : ''}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="space-y-3 m-0">
            <Dropzone
              label="Drop Candidate Resume PDF"
              onFilesAccepted={(files) => uploadMultiple(files, 'resume')}
            />

            {isResumesError && (
              <p className="text-center text-xs text-destructive py-2">
                Failed to load resumes
              </p>
            )}

            {isResumesLoading ? (
              <div className="space-y-2.5 pt-1">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : resumes && resumes.length > 0 ? (
              <ul className="space-y-2.5 pt-1">
                {resumes.map((resume) => {
                  const isReady = resume.status === 'READY';
                  const isSelected = selectedResumeId === resume.id;
                  const candidateName =
                    resume.parsedProfile?.name || resume.fileName;
                  const currentTitle =
                    resume.parsedProfile?.experience?.[0]?.title;

                  const skills = [
                    ...(resume.parsedProfile?.skills?.languages || []),
                    ...(resume.parsedProfile?.skills?.frameworks || []),
                  ];
                  const displaySkills = skills.slice(0, 3);
                  const remainingSkills = skills.length - displaySkills.length;

                  return (
                    <li
                      key={resume.id}
                      onClick={() => {
                        if (!isReady) return;
                        setSelectedResumeId(isSelected ? null : resume.id);
                      }}
                      className={cn(
                        'group relative flex flex-col gap-2 p-3 rounded-xl border transition-all text-left shadow-2xs',
                        isReady
                          ? 'cursor-pointer hover:border-primary/40 bg-card hover:shadow-xs'
                          : 'opacity-70 cursor-not-allowed bg-muted/20 border-dashed',
                        isSelected
                          ? 'border-primary ring-1 ring-primary/30 bg-primary/3'
                          : 'border-border/80',
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isSelected}
                            disabled={!isReady}
                            onCheckedChange={() => {
                              if (!isReady) return;
                              setSelectedResumeId(
                                isSelected ? null : resume.id,
                              );
                            }}
                          />
                        </div>

                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileTextIcon className="size-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-semibold text-xs text-foreground truncate">
                              {candidateName}
                            </h4>
                            <StatusBadge status={resume.status} />
                          </div>

                          {currentTitle && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {currentTitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {displaySkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pl-6 pt-0.5">
                          {displaySkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {remainingSkills > 0 && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              +{remainingSkills}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pl-6 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{resume.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(resume.fileSize)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteResume(resume.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer rounded hover:bg-muted"
                          title="Delete resume"
                        >
                          <Trash2Icon className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <FileTextIcon className="size-8 mx-auto mb-1.5 opacity-30" />
                <p className="font-medium text-foreground">No resumes yet</p>
                <p className="text-[11px] mt-0.5">
                  Drop a PDF above to extract candidate profile
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="job-postings" className="space-y-3 m-0">
            <Dropzone
              label="Drop Job Posting PDF"
              onFilesAccepted={(files) => uploadMultiple(files, 'job')}
            />

            {isJobsError && (
              <p className="text-center text-xs text-destructive py-2">
                Failed to load job postings
              </p>
            )}

            {isJobsLoading ? (
              <div className="space-y-2.5 pt-1">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <ul className="space-y-2.5 pt-1">
                {jobs.map((job) => {
                  const isReady = job.status === 'READY';
                  const isSelected = selectedJobIds.includes(job.id);
                  const jobTitle =
                    job.title || job.parsedData?.role || 'Untitled Job';
                  const company = job.company;
                  const level = job.parsedData?.level;
                  const expYears = job.parsedData?.experienceYears;
                  const requiredSkills =
                    job.parsedData?.requiredSkills?.slice(0, 3) || [];
                  const remainingSkillsCount =
                    (job.parsedData?.requiredSkills?.length || 0) -
                    requiredSkills.length;

                  return (
                    <li
                      key={job.id}
                      onClick={() => {
                        if (!isReady) return;
                        handleToggleJob(job.id);
                      }}
                      className={cn(
                        'group relative flex flex-col gap-2 p-3 rounded-xl border transition-all text-left shadow-2xs',
                        isReady
                          ? 'cursor-pointer hover:border-primary/40 bg-card hover:shadow-xs'
                          : 'opacity-70 cursor-not-allowed bg-muted/20 border-dashed',
                        isSelected
                          ? 'border-primary ring-1 ring-primary/30 bg-primary/3'
                          : 'border-border/80',
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isSelected}
                            disabled={!isReady}
                            onCheckedChange={() => {
                              if (!isReady) return;
                              handleToggleJob(job.id);
                            }}
                          />
                        </div>

                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <BriefcaseIcon className="size-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-semibold text-xs text-foreground truncate">
                              {jobTitle}
                            </h4>
                            <StatusBadge status={job.status} />
                          </div>

                          {(company || level || expYears) && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mt-0.5">
                              {company && (
                                <span className="flex items-center gap-1 truncate">
                                  <Building2Icon className="size-3 shrink-0" />
                                  {company}
                                </span>
                              )}
                              {company && (level || expYears) && <span>•</span>}
                              {level && (
                                <span className="capitalize">{level}</span>
                              )}
                              {expYears && <span>{expYears}+ yrs</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {requiredSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pl-6 pt-0.5">
                          {requiredSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {remainingSkillsCount > 0 && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              +{remainingSkillsCount}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pl-6 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{job.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(job.fileSize)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJob(job.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer rounded hover:bg-muted"
                          title="Delete job posting"
                        >
                          <Trash2Icon className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <BriefcaseIcon className="size-8 mx-auto mb-1.5 opacity-30" />
                <p className="font-medium text-foreground">
                  No job postings yet
                </p>
                <p className="text-[11px] mt-0.5">
                  Drop a PDF above to extract requirements
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SidebarContent>
    </Sidebar>
  );
}
