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
} from "@/components/ui/card";
import MyPagination from '@/components/ui/my-pagination';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/lib/permissions';
import apiKeys from '@/routes/api-keys';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'API Keys',
        href: apiKeys.index().url,
    },
];

interface ApiKey {
    id: number,
    name: string,
    key: string,
    state: boolean,
}

interface LinkProps {
    active: boolean,
    label: string,
    page: number,
    url: string
}

interface ProductPagination {
    data: ApiKey[],
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
    const [loadingId, setLoadingId] = useState<number | null>(null);
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

    const handleToggle = (id: number) => {
        setLoadingId(id);

        router.patch(apiKeys.toggle(id), {}, {
            preserveScroll: true,
            onFinish: () => setLoadingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API Keys" />
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>List</CardTitle>
                    <CardDescription>
                        Showing {list.from} to {list.to} of {list.total} entries
                    </CardDescription>
                    {can('api-keys.create') && (
                        <CardAction>
                            <Link href={apiKeys.create()}>
                                <Button>Create a API Key</Button>
                            </Link>
                        </CardAction>
                    )}
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
                                <TableHead>State</TableHead>
                                {canAny(['api-keys.edit', 'api-keys.delete']) && (
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
                                        <TableCell>{(
                                            <Switch
                                                checked={item.state}
                                                onCheckedChange={() => handleToggle(item.id)}
                                                disabled={loadingId === item.id}
                                            />
                                        )}</TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            {can('api-keys.edit') && (
                                                <DeleteDialog
                                                    itemName={item.name}
                                                    onConfirm={() => destroy(apiKeys.destroy.url(item.id))}/>
                                            )}
                                            {can('api-keys.edit') && (
                                                <>
                                                    <Button
                                                        className="bg-yellow-500 text-white"
                                                        onClick={() => {
                                                            if (confirm("Regenerate this API Key?")) {
                                                                router.put(apiKeys.regenerate.url(item.id));
                                                            }
                                                        }}
                                                    >
                                                        Regenerate
                                                    </Button>
                                                    <Link href={apiKeys.edit.url(item.id)}>
                                                        <Button className="bg-primary text-white dark:text-black">Edit</Button>
                                                    </Link>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length == 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={canAny(['api-keys.edit', 'api-keys.delete']) ? 4 : 3}
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
