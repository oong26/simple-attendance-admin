import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, PackageSearch, UserCog, GlobeLock, Users, KeyRound } from 'lucide-react';
import AppLogo from './app-logo';
import products from '@/routes/products';
import users from '@/routes/users';
import roles from '@/routes/roles';
import session from '@/routes/session';
import apiSession from '@/routes/api-session';
import apiKey from '@/routes/api-keys';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Products',
        href: products.index(),
        icon: PackageSearch,
        permission: 'products.view',
    },
    {
        title: 'Users',
        href: users.index(),
        icon: Users,
        permission: 'users.view',
    },
];

const settingNavItems: NavItem[] = [
    {
        title: 'Role & Permission',
        href: roles.index(),
        icon: UserCog,
        permission: 'roles.view',
    },
    {
        title: 'Session',
        href: session.index(),
        icon: GlobeLock,
        permission: 'sessions.view',
    },
    {
        title: 'API Session',
        href: apiSession.index(),
        icon: GlobeLock,
        permission: 'api-sessions.view',
    },
    {
        title: 'API Keys',
        href: apiKey.index(),
        icon: KeyRound,
        permission: 'api-keys.view',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/oong26/laravel-react-starter',
        icon: Folder,
    },
    {
        title: 'Laravel Doc',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} title="Main Menu" />
                <NavMain items={settingNavItems} title="System" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
