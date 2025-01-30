import Header from '@/Components/Header';
import { Button } from '@/Components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarProvider,
} from '@/Components/ui/sidebar';
import { router } from '@inertiajs/react';
import {
    Database,
    Globe2,
    LayoutDashboard,
    LogOut,
    Rocket,
    Route,
    ScrollText,
    Shield,
    Zap,
} from 'lucide-react';
import { NavMain } from './NavMain';

interface Props {
    header?: React.ReactNode;
    children: React.ReactNode;
}

const navigationItems = [
    { title: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
    { title: 'Resources', href: 'resources.index', icon: Database },
    { title: 'Starships', href: 'starships.index', icon: Rocket },
    { title: 'Trade Routes', href: 'trade-routes.index', icon: Route },
    {
        title: 'Trade Agreements',
        href: 'trade-agreements.index',
        icon: ScrollText,
    },
    { title: 'Planets', href: 'planets.index', icon: Globe2 },
    { title: 'Weather', href: 'weather.index', icon: Zap },
    { title: 'Roles', href: 'roles.index', icon: Shield },
];

export default function AuthenticatedLayout({ children }: Props) {
    return (
        <SidebarProvider>
            <Sidebar variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <div className="flex items-center gap-2">
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary">
                                <Rocket className="h-4 w-4" />
                            </div>
                            <span className="text-lg font-bold">Galactica</span>
                        </div>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={navigationItems} />
                </SidebarContent>
                <SidebarFooter>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => router.post(route('logout'))}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </Button>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <Header />
                <main className="mt-4 flex flex-1 flex-col gap-4 p-4 sm:py-0 md:gap-8 md:px-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
