import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';

export function FileSidebar({
  side = 'right',
  collapsible = 'offcanvas',
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side={side}
      collapsible={collapsible}
      className={className}
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        text text text text
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
