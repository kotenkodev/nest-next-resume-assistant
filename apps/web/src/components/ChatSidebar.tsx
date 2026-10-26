'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  SparklesIcon,
  PlusIcon,
  MessageSquareIcon,
  Trash2Icon,
  Loader2Icon,
  FileTextIcon,
  BriefcaseIcon,
} from 'lucide-react';
import { UserMenu } from './UserMenu';
import { chatApi } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/store/workspace';
import { toast } from 'sonner';

export function ChatSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const params = useParams<{ id?: string[] }>();
  const currentConversationId = params?.id?.[0];
  const queryClient = useQueryClient();

  const {
    selectedResumeId,
    selectedJobIds,
    setSelectedResumeId,
    setSelectedJobIds,
  } = useWorkspaceStore();

  const {
    data: conversations,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    refetch,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.listConversations,
  });

  const { mutate: createConversation, isPending: isCreating } = useMutation({
    mutationFn: chatApi.createConversation,
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('New conversation started');
      router.push(`/${newConversation.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create conversation');
    },
  });

  const { mutate: deleteConversation, isPending: isDeleting } = useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation deleted');
      if (currentConversationId === deletedId) {
        router.push('/');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete conversation');
    },
  });

  const handleCreateConversation = () => {
    if (!selectedResumeId) {
      toast.warning('Please select a resume from the right sidebar first.');
      return;
    }
    if (selectedJobIds.length === 0) {
      toast.warning('Please select at least one job posting to chat with.');
      return;
    }

    createConversation({
      resumeId: selectedResumeId,
      jobPostingIds: selectedJobIds,
    });
  };

  const handleSelectConversation = (conversation: {
    id: string;
    resumeId: string;
    jobPostingIds: string[];
  }) => {
    if (conversation.resumeId) {
      setSelectedResumeId(conversation.resumeId);
    }
    if (conversation.jobPostingIds?.length) {
      setSelectedJobIds(conversation.jobPostingIds);
    }
    router.push(`/${conversation.id}`);
  };

  return (
    <Sidebar className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <SparklesIcon className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm text-foreground">
              Career Intel
            </span>
            <span className="text-[11px] text-muted-foreground">
              Resume & Job Matcher
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-3 pb-1">
          <Button
            onClick={handleCreateConversation}
            disabled={isCreating}
            className="w-full justify-start gap-2 h-9 text-xs font-medium cursor-pointer shadow-xs"
          >
            {isCreating ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            New Conversation
          </Button>

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileTextIcon className="size-3" />
              {selectedResumeId ? '1 Resume' : 'No Resume'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BriefcaseIcon className="size-3" />
              {selectedJobIds.length > 0
                ? `${selectedJobIds.length} Job${selectedJobIds.length > 1 ? 's' : ''}`
                : 'No Jobs'}
            </span>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground px-3">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isConversationsLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))
              ) : isConversationsError ? (
                <div className="p-4 text-center text-xs text-destructive">
                  <p>Failed to load conversations</p>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => refetch()}
                    className="mt-2 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const isActive = currentConversationId === conversation.id;

                  return (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleSelectConversation(conversation)}
                        className="group/item flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors"
                      >
                        <MessageSquareIcon className="size-3.5 shrink-0 text-muted-foreground group-hover/item:text-foreground" />
                        <span className="truncate flex-1">
                          {conversation.title || 'Untitled Conversation'}
                        </span>
                      </SidebarMenuButton>

                      <SidebarMenuAction
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        showOnHover
                        className="hover:text-destructive transition-colors cursor-pointer"
                        title="Delete conversation"
                      >
                        <Trash2Icon className="size-3.5" />
                        <span className="sr-only">Delete</span>
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <MessageSquareIcon className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-foreground">No chats yet</p>
                  <p className="mt-1 text-[11px]">
                    Select a resume & job from the right sidebar to start.
                  </p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="w-full rounded-md bg-sidebar-accent/50 p-2 text-xs">
              <UserMenu />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
