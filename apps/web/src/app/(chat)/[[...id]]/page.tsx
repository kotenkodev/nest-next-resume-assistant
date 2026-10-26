import { Chat } from '@/components/Chat';
import FitAnalysisView from '@/components/FitAnalysisView';
import JobMatchesView from '@/components/JobMatchesView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SparklesIcon,
  FileTextIcon,
  BriefcaseIcon,
  MessageSquareIcon,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id?: string[] }>;
}

export default async function Home({ params }: PageProps) {
  const resolvedParams = await params;
  const conversationId = resolvedParams.id?.[0];

  // 1. If NO conversation is active, show the Welcome / Empty state
  if (!conversationId) {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <SparklesIcon className="size-7" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Career Intelligence Assistant
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-md">
          Analyze resume fit across multiple job postings, discover skill gaps,
          and practice tailored interview questions.
        </p>

        {/* 3 Step Guide */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-4 rounded-xl border bg-card">
            <FileTextIcon className="size-5 text-primary mb-2" />
            <h3 className="font-semibold text-xs">1. Select Resume</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Upload and select candidate resume from the right sidebar.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <BriefcaseIcon className="size-5 text-primary mb-2" />
            <h3 className="font-semibold text-xs">2. Select Job(s)</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Select 1 or more job postings to evaluate against your resume.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <MessageSquareIcon className="size-5 text-primary mb-2" />
            <h3 className="font-semibold text-xs">3. Start Conversation</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Click &quot;New Conversation&quot; on the left sidebar to start.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. When a conversation IS active, show the Tabs
  return (
    <div className="flex h-full w-full flex-1 min-h-0 flex-col overflow-hidden">
      <Tabs
        defaultValue="chat"
        className="flex flex-1 flex-col h-full min-h-0 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b px-6 py-2 bg-background/50 backdrop-blur shrink-0">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="fit">Fit Analysis</TabsTrigger>
            <TabsTrigger value="matches">Matching Jobs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="chat"
          className="flex-1 min-h-0 overflow-hidden m-0"
        >
          <Chat conversationId={conversationId} />
        </TabsContent>

        <TabsContent
          value="fit"
          className="flex-1 min-h-0 overflow-y-auto p-6 m-0"
        >
          <FitAnalysisView conversationId={conversationId} />
        </TabsContent>

        <TabsContent
          value="matches"
          className="flex-1 min-h-0 overflow-y-auto p-6 m-0"
        >
          <JobMatchesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
