import DeleteDialog from '@/components/delete-dialog';
import TableControls from '@/components/table-controls';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import MyPagination from '@/components/ui/my-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/lib/permissions';
import users from '@/routes/users';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index().url,
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface LinkProps {
    active: boolean;
    label: string;
    page: number;
    url: string;
}

interface UserPagination {
    data: User[];
    links: LinkProps[];
    from: number;
    to: number;
}

interface PageProps {
    list: UserPagination;
    q: string | null;
}

export default function Index() {
    const { list, q } = usePage().props as PageProps;
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get('perPage') ?? '10',
    );
    const { processing, delete: destroy } = useForm();
    const { can, canAny } = usePermission();

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
            router.get(
                '',
                { q: value, perPage: pageLength },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 500);
    };

    const handlePageLengthChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = e.target.value;
        setPageLength(value);

        router.get(
            '',
            { q: search, perPage: value, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>List</CardTitle>
                    <CardDescription>
                        Showing {list.from} to {list.to} of {list.total} entries
                    </CardDescription>
                    <CardAction>
                        {can('users.create') && (
                            <Link href={users.create()}>
                                <Button>Create a user</Button>
                            </Link>
                        )}
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <TableControls
                        search={search}
                        pageLength={pageLength}
                        onSearchChange={handleSearchChange}
                        onPageLengthChange={handlePageLengthChange}
                    />
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                {(can('users.delete') || can('users.edit')) && (
                                    <TableHead className="text-center">
                                        Action
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item, i) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {list.from + i}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>
                                            {item.role ? item.role.name : '-'}
                                        </TableCell>
                                        {canAny([
                                            'users.delete',
                                            'users.edit',
                                        ]) && (
                                            <TableCell className="space-x-2 text-center">
                                                {can('users.delete') && (
                                                    <DeleteDialog
                                                        itemName={item.name}
                                                        onConfirm={() =>
                                                            destroy(
                                                                users.destroy.url(
                                                                    item.id,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                )}
                                                {can('users.edit') && (
                                                    <Link
                                                        href={users.edit.url(
                                                            item.id,
                                                        )}
                                                    >
                                                        <Button className="bg-primary text-white dark:text-black">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length == 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            canAny([
                                                'users.delete',
                                                'users.edit',
                                            ])
                                                ? 5
                                                : 4
                                        }
                                        className="text-center"
                                    >
                                        No records.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                    {/* Pagination */}
                    {list.data.length > 0 && <MyPagination data={list} />}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
