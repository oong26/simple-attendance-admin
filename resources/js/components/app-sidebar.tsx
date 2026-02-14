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
import { BookOpen, Folder, LayoutGrid, PackageSearch, UserCog, GlobeLock, Users, KeyRound, Building2, Clock, Calendar, ClipboardList, Settings as SettingsIcon } from 'lucide-react';
import AppLogo from './app-logo';
import products from '@/routes/products';
import users from '@/routes/users';
import roles from '@/routes/roles';
import session from '@/routes/session';
import apiSession from '@/routes/api-session';
import apiKey from '@/routes/api-keys';
import departments from '@/routes/departments';
import shifts from '@/routes/shifts';
import employees from '@/routes/employees';
import holidays from '@/routes/holidays';
import attendances from '@/routes/attendances';
import attendance from '@/routes/attendance';
import settings from '@/routes/settings';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Monitor',
        href: attendance && attendance.monitor ? attendance.monitor() : '#', // Safety check if route not yet generated
        icon: ClipboardList,
    },
    {
        title: 'Departments',
        href: departments ? departments.index() : '#',
        icon: Building2,
    },
    {
        title: 'Shifts',
        href: shifts ? shifts.index() : '#',
        icon: Clock,
    },
    {
        title: 'Employees',
        href: employees ? employees.index() : '#',
        icon: Users,
    },
    {
        title: 'Holidays',
        href: holidays ? holidays.index() : '#',
        icon: Calendar,
    },
    {
        title: 'Attendance History',
        href: attendances ? attendances.index() : '#',
        icon: ClipboardList,
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
        title: 'Global Settings',
        href: settings ? settings.index() : '#',
        icon: SettingsIcon,
    },
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
