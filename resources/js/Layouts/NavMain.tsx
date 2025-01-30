import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/Components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = route().current(item.href.split('.')[0] + '.*');
          return (          
              <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link
                      href={route(item.href)}
                      className={cn(
                        'group relative flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium',
                        isActive && 'text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
} 