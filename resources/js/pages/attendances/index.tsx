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
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Input } from '@/components/ui/input';
import attendances from '@/routes/attendances';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance History',
        href: '/attendances',
    },
];

interface Attendance {
    id: number;
    date: string;
    clock_in_time: string;
    clock_out_time: string | null;
    status: string;
    late_minutes: number;
    employee: {
        name: string;
        department: { name: string } | null;
        shift: { name: string } | null;
    };
}

interface PageProps {
    list: any;
    employees: { id: number; name: string }[];
    date: string | null;
    month: string | null;
}

export default function Index() {
    const { list, employees, date, month } = usePage<any>().props as PageProps;
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get("perPage") ?? "20"
    );
    
    // Filters
    const [filterDate, setFilterDate] = useState(date ?? '');
    const [filterMonth, setFilterMonth] = useState(month ?? '');
    const [filterEmployee, setFilterEmployee] = useState(new URLSearchParams(window.location.search).get("employee_id") ?? '');

    const applyFilters = () => {
        router.get(attendances.index().url, { 
            date: filterDate, 
            month: filterMonth, 
            employee_id: filterEmployee,
            perPage: pageLength, 
            page: 1 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPageLength(value);
        // Re-apply current filters with new page length
        router.get(attendances.index().url, { 
            date: filterDate, 
            month: filterMonth, 
            employee_id: filterEmployee,
            perPage: value, 
            page: 1 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterMonth('');
        setFilterEmployee('');
        router.get(attendances.index().url);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance History" />
            <div className="flex flex-col gap-4 m-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                                onChange={(e) => setFilterEmployee(e.target.value)}
                            >
                                <NativeSelectOption value="">All Employees</NativeSelectOption>
                                {employees.map((emp) => (
                                    <NativeSelectOption key={emp.id} value={emp.id}>{emp.name}</NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={applyFilters}>Filter</Button>
                            <Button variant="outline" onClick={clearFilters}>Clear</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attendance List</CardTitle>
                        <CardDescription>
                            Showing {list.from} to {list.to} of {list.total} entries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end mb-4">
                             <NativeSelect
                                value={pageLength}
                                onChange={handlePageLengthChange}
                                className="w-[80px]"
                            >
                                <NativeSelectOption value="10">10</NativeSelectOption>
                                <NativeSelectOption value="20">20</NativeSelectOption>
                                <NativeSelectOption value="50">50</NativeSelectOption>
                                <NativeSelectOption value="100">100</NativeSelectOption>
                            </NativeSelect>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Late (min)</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            {list.data.length > 0 && (
                                <TableBody>
                                    {list.data.map((item: Attendance) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>
                                                <div>{item.employee.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.employee.department?.name}</div>
                                            </TableCell>
                                            <TableCell>{item.employee.shift?.name}</TableCell>
                                            <TableCell>{item.clock_in_time}</TableCell>
                                            <TableCell>{item.clock_out_time ?? '-'}</TableCell>
                                            <TableCell className={item.late_minutes > 0 ? 'text-red-500 font-bold' : ''}>
                                                {item.late_minutes}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs capitalize ${
                                                    item.status === 'late' ? 'bg-red-100 text-red-800' : 
                                                    item.status === 'present' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            )}
                            {list.data.length === 0 && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No records found.</TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                        {list.data.length > 0 && (
                            <MyPagination data={list} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
