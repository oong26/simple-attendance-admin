import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import MyPagination from '@/components/ui/my-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { usePermission } from '@/lib/permissions';
import TableControls from '@/components/table-controls';
import DeleteDialog from '@/components/delete-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: roles.index().url,
    },
];

interface Role {
    id: number,
    name: string,
    guard_name: string,
    state: boolean,
}

interface LinkProps {
    active: boolean,
    label: string,
    page: number,
    url: string
}

interface ProductPagination {
    data: Role[],
    links: LinkProps[],
    from: number,
    to: number
}

interface PageProps {
    list: ProductPagination,
    q: string | null
}

export default function Index() {
    const {list, q} = usePage().props as PageProps;
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get("perPage") ?? "10"
    );
    const {processing, delete: destroy} = useForm();
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
            <Head title="Roles" />
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>List</CardTitle>
                    <CardDescription>
                        Showing {list.from} to {list.to} of {list.total} entries
                    </CardDescription>
                    <CardAction>
                        {can("roles.create") && (
                            <Link href={roles.create()}>
                                <Button>Create a role</Button>
                            </Link>
                        )}
                    </CardAction>
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
                                {canAny(['roles.edit', 'roles.delete']) && (
                                    <TableHead className="text-center">Action</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item, i) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{list.from + i}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        {canAny(['roles.edit', 'roles.delete']) && (
                                            <TableCell className="space-x-2 text-center">
                                                {can('roles.delete') && (
                                                    <DeleteDialog
                                                        itemName={item.name}
                                                        onConfirm={() => destroy(roles.destroy.url(item.id))}
                                                    />
                                                )}
                                                {can('roles.edit') && (
                                                    <Link href={roles.edit.url(item.id)}>
                                                        <Button className="bg-primary text-white dark:text-black">Edit</Button>
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
                                    <TableCell colSpan={canAny(['roles.edit', 'roles.delete']) ? 3 : 2}
                                        className="text-center">No records.</TableCell>
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
