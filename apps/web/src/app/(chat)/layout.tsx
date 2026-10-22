import { ChatSidebar } from '@/components/ChatSidebar';
import { FileSidebar } from '@/components/FileSidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col [--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col h-full min-h-0 overflow-hidden">
        <Header />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ChatSidebar />
          <SidebarInset className="flex-1 min-h-0 overflow-hidden">
            {children}
          </SidebarInset>
          <FileSidebar />
        </div>
      </SidebarProvider>
    </div>
  );
}
