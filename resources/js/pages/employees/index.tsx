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
import employees from '@/routes/employees';
import { Badge } from '@/components/ui/badge'; // Assuming Badge exists or use span

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

interface Employee {
    id: number;
    name: string;
    email: string;
    phone: string;
    department: { name: string } | null;
    shift: { name: string } | null;
    photo_url: string | null;
    is_active: boolean;
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            router.get(employees.index().url, { q: value, perPage: pageLength }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);
    };

    const handlePageLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPageLength(value);

        router.get(employees.index().url, { q: search, perPage: value, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <Card className="m-4">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Employees</CardTitle>
                            <CardDescription>
                                Showing {list.from} to {list.to} of {list.total} entries
                            </CardDescription>
                        </div>
                        <Link href={employees.create().url}>
                            <Button>Create Employee</Button>
                        </Link>
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
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item: Employee, i: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{list.from + i}</TableCell>
                                        <TableCell>
                                            {item.photo_url ? (
                                                <img src={item.photo_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    No Img
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>{item.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.email}</div>
                                        </TableCell>
                                        <TableCell>{item.department?.name ?? '-'}</TableCell>
                                        <TableCell>{item.shift?.name ?? '-'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <DeleteDialog
                                                itemName={item.name}
                                                onConfirm={() => destroy(employees.destroy.url(item.id))}
                                            />
                                            <Link href={employees.edit.url(item.id)}>
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
                                    <TableCell colSpan={7} className="text-center">No records.</TableCell>
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
