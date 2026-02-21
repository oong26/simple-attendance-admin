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
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import TableControls from '@/components/table-controls';
import DeleteDialog from '@/components/delete-dialog';
import holidays from '@/routes/holidays';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Holidays',
        href: '/holidays',
    },
];

interface Holiday {
    id: number;
    name: string;
    date: string;
    is_recurring: boolean;
}

interface PageProps {
    list: any;
    q: string | null;
}

export default function Index() {
    const { list, q } = usePage<any>().props as PageProps;
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get("perPage") ?? "10"
    );
    const { delete: destroy } = useForm();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [syncing, setSyncing] = useState(false);

    const handleSynchronize = () => {
        setSyncing(true);
        router.post(holidays.synchronize.url(), {}, {
            onFinish: () => setSyncing(false),
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            router.get(holidays.index().url, { q: value, perPage: pageLength }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);
    };

    const handlePageLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPageLength(value);

        router.get(holidays.index().url, { q: search, perPage: value, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Holidays" />
            <Card className="m-4">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Holidays</CardTitle>
                            <CardDescription>
                                Showing {list.from} to {list.to} of {list.total} entries
                            </CardDescription>
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleSynchronize}
                                disabled={syncing}
                            >
                                {syncing ? 'Syncing...' : 'Sync National Holidays'}
                            </Button>
                            <Link href={holidays.create().url}>
                                <Button>Create Holiday</Button>
                            </Link>
                        </div>
                    </div>
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
                                <TableHead>Date</TableHead>
                                <TableHead>Recurring</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item: Holiday, i: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{list.from + i}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.is_recurring ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <DeleteDialog
                                                itemName={item.name}
                                                onConfirm={() => destroy(holidays.destroy.url(item.id))}
                                            />
                                            <Link href={holidays.edit.url(item.id)}>
                                                <Button className="bg-primary text-white dark:text-black">Edit</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length === 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No records.</TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                    {list.data.length > 0 && (
                        <MyPagination data={list} />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
