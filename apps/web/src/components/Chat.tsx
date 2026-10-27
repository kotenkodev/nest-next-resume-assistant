'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, jobsApi, resumesApi } from '@/api';
import { Markdown } from '@/components/markdown';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Message, MessageContent } from '@/components/ui/message';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUpIcon,
  SquareIcon,
  SparklesIcon,
  UserIcon,
  BriefcaseIcon,
  RotateCcwIcon,
  Loader2Icon,
  MessageSquareIcon,
  Building2Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatProps {
  conversationId?: string;
}

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}

const PROMPT_SUGGESTIONS = [
  'How well does this candidate fit the primary job requirements?',
  'What are the most critical missing skills or skill gaps?',
  'Draft 3 targeted technical interview questions probing candidate gaps.',
  'Summarize the candidate’s core strengths and experience highlights.',
];

export function Chat({ conversationId }: ChatProps) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: conversation,
    isLoading: isConvoLoading,
    refetch: refetchConvo,
  } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatApi.getConversation(conversationId!),
    enabled: !!conversationId,
  });

  const { data: resume } = useQuery({
    queryKey: ['resume', conversation?.resumeId],
    queryFn: () => resumesApi.get(conversation!.resumeId),
    enabled: !!conversation?.resumeId,
  });

  const { data: allJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.list(),
    enabled: !!conversation?.jobPostingIds?.length,
  });

  const targetJobs = useMemo(() => {
    if (!allJobs || !conversation?.jobPostingIds) return [];
    const idSet = new Set(conversation.jobPostingIds);
    return allJobs.filter((j) => idSet.has(j.id));
  }, [allJobs, conversation?.jobPostingIds]);

  useEffect(() => {
    if (conversation?.messages && !isGenerating) {
      setMessages(conversation.messages);
    }
  }, [conversation?.messages, isGenerating]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isGenerating ? 'auto' : 'smooth');
  }, [messages, isGenerating]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !conversationId || isGenerating) return;

    setInput('');
    setIsGenerating(true);

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    const userMessage: LocalMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const initialAssistantMessage: LocalMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await chatApi.streamMessage(
        conversationId,
        trimmed,
        {
          onChunk: (chunk: string) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: m.content + chunk }
                  : m,
              ),
            );
          },
          onDone: () => {
            setIsGenerating(false);
            abortControllerRef.current = null;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
              ),
            );
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({
              queryKey: ['conversation', conversationId],
            });
          },
          onError: (error: Error) => {
            setIsGenerating(false);
            abortControllerRef.current = null;
            toast.error(error.message || 'Streaming failed');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content:
                        m.content ||
                        '⚠️ *An error occurred while generating response. Please try again.*',
                      isStreaming: false,
                    }
                  : m,
              ),
            );
          },
        },
        controller.signal,
      );
    } catch {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      setMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
      );
      toast.info('Generation cancelled');
    }
  };

  const candidateName =
    resume?.parsedProfile?.name || resume?.fileName || 'Candidate';

  if (!conversationId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <MessageSquareIcon className="size-12 mb-3 opacity-25" />
        <h3 className="text-base font-semibold text-foreground">
          No Conversation Selected
        </h3>
        <p className="mt-1 text-xs max-w-sm">
          Select or create a conversation from the left sidebar to start
          chatting with the career assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-2.5 bg-card/40 backdrop-blur shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <SparklesIcon className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-foreground truncate">
              {conversation?.title || 'Career Intelligence Chat'}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 font-medium text-foreground truncate">
                <UserIcon className="size-3 text-primary" />
                {candidateName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="size-3" />
                {targetJobs.length} {targetJobs.length === 1 ? 'Job' : 'Jobs'}{' '}
                context
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refetchConvo()}
          disabled={isGenerating || isConvoLoading}
          aria-label="Refresh conversation"
          title="Refresh conversation history"
        >
          <RotateCcwIcon className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 space-y-5">
        {isConvoLoading && messages.length === 0 ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-16 w-3/4 rounded-2xl ml-auto" />
            <Skeleton className="h-28 w-5/6 rounded-2xl" />
            <Skeleton className="h-16 w-2/3 rounded-2xl ml-auto" />
          </div>
        ) : messages.length === 0 ? (
          /* Empty Thread / Starter Prompts */
          <div className="flex h-full flex-col items-center justify-center max-w-xl mx-auto text-center p-6">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <SparklesIcon className="size-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Career Intelligence Assistant
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              Evaluating candidate{' '}
              <strong className="text-foreground">{candidateName}</strong>{' '}
              against{' '}
              <strong className="text-foreground">
                {targetJobs.length} selected job posting(s)
              </strong>
              .
            </p>

            {targetJobs.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-md">
                {targetJobs.map((j) => (
                  <span
                    key={j.id}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border"
                  >
                    <Building2Icon className="size-3 text-muted-foreground" />
                    {j.title || j.parsedData?.role || j.fileName}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 w-full text-left space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested Prompts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-3 text-xs text-left rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
                  >
                    &ldquo;{suggestion}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <Message key={message.id} align="end">
                    <MessageContent className="items-end">
                      <Bubble
                        align="end"
                        variant="default"
                        className="rounded-2xl px-4 py-2.5"
                      >
                        <BubbleContent className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </BubbleContent>
                      </Bubble>
                      {message.createdAt && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </MessageContent>
                  </Message>
                );
              }

              return (
                <Message key={message.id} align="start">
                  <div className="flex gap-3 w-full">
                    <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <SparklesIcon className="size-3.5" />
                    </div>

                    <MessageContent className="flex-1 min-w-0">
                      <Bubble
                        align="start"
                        variant="ghost"
                        className="p-0 w-full max-w-full text-foreground"
                      >
                        <BubbleContent className="text-xs sm:text-sm w-full p-0 text-foreground">
                          {message.content ? (
                            <Markdown>{message.content}</Markdown>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                              <Loader2Icon className="size-3.5 animate-spin text-primary" />
                              <span>Thinking...</span>
                            </div>
                          )}
                        </BubbleContent>
                      </Bubble>

                      {message.isStreaming && message.content && (
                        <div className="flex items-center gap-1.5 text-[11px] text-primary mt-1">
                          <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                          <span>Generating answer...</span>
                        </div>
                      )}
                    </MessageContent>
                  </div>
                </Message>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 pt-2 border-t bg-card/20 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="max-w-3xl mx-auto"
        >
          <InputGroup className="rounded-xl border border-border shadow-xs bg-card focus-within:border-primary/60 transition-all">
            <InputGroupTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about candidate fit, skill gaps, or interview talking points..."
              disabled={isGenerating}
              className="min-h-12 max-h-36 py-2.5 text-xs sm:text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
            />

            <InputGroupAddon
              align="block-end"
              className="px-2 pb-2 pt-0 justify-between"
            >
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Press{' '}
                <kbd className="px-1 py-0.5 rounded bg-muted font-mono">
                  Enter
                </kbd>{' '}
                to send,{' '}
                <kbd className="px-1 py-0.5 rounded bg-muted font-mono">
                  Shift+Enter
                </kbd>{' '}
                for newline
              </span>

              <div className="ml-auto flex items-center gap-1.5">
                {isGenerating ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={handleStopGeneration}
                    className="size-7 rounded-lg"
                    title="Stop generating"
                  >
                    <SquareIcon className="size-3 fill-current" />
                  </Button>
                ) : (
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!input.trim()}
                    className="size-7 rounded-lg"
                  >
                    <ArrowUpIcon className="size-3.5" />
                    <span className="sr-only">Send message</span>
                  </InputGroupButton>
                )}
              </div>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  );
}
