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
import apiKey from '@/routes/api-keys';
import apiSession from '@/routes/api-session';
import attendance from '@/routes/attendance';
import attendances from '@/routes/attendances';
import departments from '@/routes/departments';
import employees from '@/routes/employees';
import holidays from '@/routes/holidays';
import roles from '@/routes/roles';
import session from '@/routes/session';
import users from '@/routes/users';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    ClipboardList,
    Folder,
    Globe,
    GlobeLock,
    KeyRound,
    LayoutGrid,
    Settings as SettingsIcon,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

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
        title: 'Attendance',
        href: attendances ? attendances.index() : '#',
        icon: ClipboardList,
    },
    {
        title: 'Monthly Report',
        href: '/reports/monthly-attendance',
        icon: Calendar,
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
        title: 'Master Late Deductions',
        href: '/late-deductions',
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
        title: 'Solusi Makmur',
        href: 'https://solusimakmur.com',
        icon: Globe,
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
