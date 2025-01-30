import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { SidebarTrigger } from '@/Components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { Plus, Route } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { Fragment } from 'react';

const Header = () => {
  const { url } = usePage();
  const pathnames = url.split('/').filter((path) => path);

  const quickActions = [
    {
      route: 'starships.index',
      icon: Plus,
      tooltip: 'Add new starship'
    },
    {
      route: 'trade-routes.index',
      icon: Route,
      tooltip: 'Create new trade route'
    }
  ].filter(action => route().has(action.route));

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {pathnames.map((path, key) => {
              const href = `/${pathnames.slice(0, key + 1).join('/')}`;
              const crumb = path[0].toUpperCase() + path.slice(1, path.length).replace(/-/g, ' ');
              const lastCrumb = key === pathnames.length - 1;
              
              return (
                <Fragment key={key}>
                  <BreadcrumbItem>
                    {!lastCrumb ? (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{crumb}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!lastCrumb && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        {quickActions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href={route(action.route)}>
                  <action.icon className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{action.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </header>
  );
};

export default Header; 