import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePermission } from '@/lib/permissions';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
        permission: 'settings.profile.view',
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: null,
        permission: 'settings.password.update',
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: null,
        permission: 'settings.2fa',
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
        permission: 'settings.appearance.update',
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // SSR protection
    if (typeof window === 'undefined') return null;

    const page: any = usePage();
    const { can } = usePermission();
    const userPermissions: string[] = page.props.auth?.user?.permissions ?? [];

    // Filter items based on permissions
    const filteredItems = sidebarNavItems.filter(
        (item) => !item.permission || can(item.permission, userPermissions),
    );

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {filteredItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(
                                        currentPath,
                                        item.href,
                                    ),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
