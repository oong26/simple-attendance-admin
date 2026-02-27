import DeleteDialog from '@/components/delete-dialog';
import TableControls from '@/components/table-controls';
import { Button } from '@/components/ui/button';
import {
    Card,
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
import departments from '@/routes/departments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: '/departments',
    },
];

interface Workday {
    day: string;
    is_working: boolean;
    start_time: string;
    end_time: string;
}

interface Department {
    id: number;
    name: string;
    workdays: Workday[] | null;
    created_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Pagination {
    data: Department[];
    links: PaginationLinks[];
    from: number;
    to: number;
    total: number;
    last_page: number;
    current_page: number;
}

interface PageProps {
    list: Pagination;
    q: string | null;
    flash: {
        type: string;
        message: string;
    };
}

export default function Index() {
    const { can, canAny } = usePermission();
    const { list, q } = usePage<any>().props as PageProps;
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get('perPage') ?? '10',
    );
    const { delete: destroy } = useForm();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            router.get(
                departments.index().url,
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
            departments.index().url,
            { q: search, perPage: value, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />
            <Card className="m-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Departments</CardTitle>
                            <CardDescription>
                                Showing {list.from} to {list.to} of {list.total}{' '}
                                entries
                            </CardDescription>
                        </div>
                        {can('departments.create') && (
                            <Link href={departments.create().url}>
                                <Button>Create Department</Button>
                            </Link>
                        )}
                    </div>
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
                                <TableHead>Workdays</TableHead>
                                {canAny(['departments.edit', 'departments.delete']) && (
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
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {item.workdays &&
                                                item.workdays.length > 0
                                                    ? item.workdays
                                                          .filter(
                                                              (w) =>
                                                                  w.is_working,
                                                          )
                                                          .map((w) => (
                                                              <span
                                                                  key={w.day}
                                                                  className="w-max rounded-md bg-secondary px-2 py-0.5 text-xs"
                                                              >
                                                                  {w.day.substring(
                                                                      0,
                                                                      3,
                                                                  )}
                                                                  :{' '}
                                                                  {w.start_time}
                                                                  -{w.end_time}
                                                              </span>
                                                          ))
                                                    : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            {can('departments.delete') && (
                                                <DeleteDialog
                                                    itemName={item.name}
                                                    onConfirm={() =>
                                                        destroy(
                                                            departments.destroy.url(
                                                                item.id,
                                                            ),
                                                        )
                                                    }
                                                />
                                            )}
                                            {can('departments.edit') && (
                                                <Link
                                                    href={departments.edit.url(
                                                        item.id,
                                                    )}
                                                >
                                                    <Button className="bg-primary text-white dark:text-black">
                                                        Edit
                                                    </Button>
                                                </Link>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length === 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={canAny(['departments.edit', 'departments.delete']) ? 4 : 3}
                                        className="text-center"
                                    >
                                        No records.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                    {list.data.length > 0 && <MyPagination data={list} />}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
