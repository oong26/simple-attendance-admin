import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import MyPagination from '@/components/ui/my-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import session from '@/routes/session';
import { usePermission } from '@/lib/permissions';
import TableControls from '@/components/table-controls';
import DeleteDialog from '@/components/delete-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Session',
        href: session.index().url,
    },
];

interface Session {
    id: number;
    user_id: number;
    ip_address: string;
    user_agent: string;
    device: string;
    last_activity: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface LinkProps {
    active: boolean,
    label: string,
    page: number,
    url: string
}

interface SessionPagination {
    data: Session[],
    links: LinkProps[],
    from: number,
    to: number
}

interface PageProps {
    list: SessionPagination,
    q: string | null
}

export default function Index() {
    const {list, q} = usePage().props as PageProps;
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get("perPage") ?? "10"
    );
    const {processing, delete: destroy} = useForm();
    const { can } = usePermission();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout (delay for 500 milliseconds)
        timeoutRef.current = setTimeout(() => {
            router.get('', { q: value, perPage: pageLength }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);
    };

    const handlePageLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPageLength(value);

        router.get('', { q: search, perPage: value, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sessions" />
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>List</CardTitle>
                    <CardDescription>
                        Showing {list.from} to {list.to} of {list.total} entries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TableControls
                        search={search}
                        pageLength={pageLength}
                        onSearchChange={handleSearchChange}
                        onPageLengthChange={handlePageLengthChange} />
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>User Agent</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Last Activity</TableHead>
                                {can('sessions.deactivate') && (
                                    <TableHead className="text-center">Action</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item, i) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{list.from + i}</TableCell>
                                        <TableCell>{item.user?.name ?? 'Unknown'}</TableCell>
                                        <TableCell>{item.user?.email ?? 'Unknown'}</TableCell>
                                        <TableCell>{item.ip_address}</TableCell>
                                        <TableCell className="truncate max-w-xs"
                                            title={item.user_agent}>{item.user_agent}</TableCell>
                                        <TableCell>{item.device ?? 'unknow'}</TableCell>
                                        <TableCell>{new Date(item.last_activity * 1000).toLocaleString()}</TableCell>
                                        {can('sessions.deactivate') && (
                                            <TableCell className="space-x-2 text-center">
                                                <DeleteDialog
                                                    deleteTitle='Deactivate'
                                                    itemName={item.user!.email}
                                                    onConfirm={() => destroy(session.deactivate.url(item.id))}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length === 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={can('sessions.deactivate') ? 8 : 7} className="text-center">
                                        No records.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>

                    {/* Pagination */}
                    {list.data.length > 0 && (
                        <MyPagination data={list} />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
