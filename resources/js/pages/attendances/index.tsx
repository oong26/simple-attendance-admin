import DeleteDialog from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MyPagination from '@/components/ui/my-pagination';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import attendances from '@/routes/attendances';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: '/attendances',
    },
];

interface Attendance {
    id: number;
    date: string;
    clock_in_time: string;
    clock_out_time: string | null;
    status: string;
    attendance_type: string;
    late_minutes: number;
    late_deduction: number;
    employee: {
        name: string;
        department: {
            name: string;
        } | null;
    };
}

interface PageProps {
    list: any;
    employees: { id: string; name: string }[];
    date: string | null;
    month: string | null;
    status: string | null;
}

export default function Index() {
    const { list, employees, date, month, status } = usePage<any>().props as PageProps;
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get('perPage') ?? '20',
    );

    // Delete
    const { processing, delete: destroy } = useForm();

    // Filters
    const [filterDate, setFilterDate] = useState(date ?? '');
    const [filterMonth, setFilterMonth] = useState(month ?? '');
    const [filterEmployee, setFilterEmployee] = useState(
        new URLSearchParams(window.location.search).get('employee_id') ?? '',
    );
    const [filterStatus, setFilterStatus] = useState(
        new URLSearchParams(window.location.search).get('status') ?? status ?? '',
    );

    const applyFilters = () => {
        router.get(
            attendances.index().url,
            {
                date: filterDate,
                month: filterMonth,
                employee_id: filterEmployee,
                status: filterStatus,
                perPage: pageLength,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageLengthChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = e.target.value;
        setPageLength(value);
        // Re-apply current filters with new page length
        router.get(
            attendances.index().url,
            {
                date: filterDate,
                month: filterMonth,
                employee_id: filterEmployee,
                status: filterStatus,
                perPage: value,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterMonth('');
        setFilterEmployee('');
        setFilterStatus('');
        router.get(attendances.index().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />
            <div className="m-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Attendance
                    </h2>
                    <Button onClick={() => router.visit(attendances.create.url())} className="bg-green-600 hover:bg-green-700 text-white">
                        New Leave
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value);
                                    setFilterMonth(''); // Clear month if date select
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Month</Label>
                            <Input
                                type="month"
                                value={filterMonth}
                                onChange={(e) => {
                                    setFilterMonth(e.target.value);
                                    setFilterDate(''); // Clear date if month select
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Employee</Label>
                            <NativeSelect
                                value={filterEmployee}
                                onChange={(e) =>
                                    setFilterEmployee(e.target.value)
                                }
                            >
                                <NativeSelectOption value="">
                                    All Employees
                                </NativeSelectOption>
                                {employees.map((emp) => (
                                    <NativeSelectOption
                                        key={emp.id}
                                        value={emp.id}
                                    >
                                        {emp.name}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <NativeSelect
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <NativeSelectOption value="">All Statuses</NativeSelectOption>
                                <NativeSelectOption value="on-time">On-time</NativeSelectOption>
                                <NativeSelectOption value="late">Late</NativeSelectOption>
                                <NativeSelectOption value="absent">Absent</NativeSelectOption>
                                <NativeSelectOption value="leave">Leave</NativeSelectOption>
                            </NativeSelect>
                        </div>
                        <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-1">
                            <Button onClick={applyFilters}>Filter</Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attendance List</CardTitle>
                        <CardDescription>
                            Showing {list.from} to {list.to} of {list.total}{' '}
                            entries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex justify-end">
                            <NativeSelect
                                value={pageLength}
                                onChange={handlePageLengthChange}
                                className="w-[80px]"
                            >
                                <NativeSelectOption value="10">
                                    10
                                </NativeSelectOption>
                                <NativeSelectOption value="20">
                                    20
                                </NativeSelectOption>
                                <NativeSelectOption value="50">
                                    50
                                </NativeSelectOption>
                                <NativeSelectOption value="100">
                                    100
                                </NativeSelectOption>
                            </NativeSelect>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Late (min)</TableHead>
                                    <TableHead>Deduction</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            {list.data.length > 0 && (
                                <TableBody>
                                    {list.data.map((item: Attendance) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {formatDate(item.date)}
                                            </TableCell>
                                            <TableCell>
                                                <div>{item.employee.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {
                                                        item.employee.department
                                                            ?.name
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.clock_in_time}
                                            </TableCell>
                                            <TableCell>
                                                {item.clock_out_time ?? '-'}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    item.late_minutes > 0
                                                        ? 'font-bold text-red-500'
                                                        : ''
                                                }
                                            >
                                                {item.late_minutes}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    item.late_deduction > 0
                                                        ? 'font-bold text-red-600'
                                                        : ''
                                                }
                                            >
                                                {item.late_deduction > 0
                                                    ? new Intl.NumberFormat(
                                                          'id-ID',
                                                          {
                                                              style: 'currency',
                                                              currency: 'IDR',
                                                          },
                                                      ).format(
                                                          item.late_deduction,
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded px-2 py-1 text-xs capitalize ${
                                                        item.status === 'late'
                                                            ? 'bg-red-100 text-red-800'
                                                            : item.status ===
                                                                'present'
                                                              ? 'bg-green-100 text-green-800'
                                                              : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {item.attendance_type}
                                            </TableCell>
                                            <TableCell>
                                                <DeleteDialog
                                                    itemName={`${item.employee.name} - ${formatDate(item.date)}`}
                                                    onConfirm={() =>
                                                        destroy(
                                                            attendances.destroy.url(
                                                                item.id,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            )}
                            {list.data.length === 0 && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center"
                                        >
                                            No records found.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                        {list.data.length > 0 && <MyPagination data={list} />}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
