import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { saveAs } from 'file-saver';
import { DownloadCloud } from 'lucide-react';
import React, { Fragment, useState } from 'react';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monthly Attendance Report',
        href: '/reports/monthly-attendance',
    },
];

interface Employee {
    id: number;
    name: string;
    department: {
        name: string;
    } | null;
}

interface AttendanceRecord {
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    late_minutes: number;
    late_deduction: number;
}

interface CalendarDay {
    day: number;
    date_string: string;
    day_name: string;
    is_weekend: boolean;
}

interface Department {
    id: number;
    name: string;
}

interface PageProps {
    monthYear: string;
    monthName: string;
    departments: Department[];
    employees: Employee[];
    attendanceMap: Record<number, Record<number, AttendanceRecord>>;
    calendar: CalendarDay[];
    selectedDepartment: number | null;
}

export default function MonthlyReport() {
    const {
        monthYear,
        monthName,
        departments,
        employees,
        attendanceMap,
        calendar,
        selectedDepartment,
    } = usePage<any>().props as PageProps;

    const [filterMonth, setFilterMonth] = useState(monthYear);
    const [filterDepartment, setFilterDepartment] = useState<string>(
        selectedDepartment ? String(selectedDepartment) : '',
    );

    const applyFilter = (monthVal: string, deptVal: string) => {
        router.get(
            '/reports/monthly-attendance',
            {
                month: monthVal,
                department_id: deptVal || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFilterMonth(val);
        applyFilter(val, filterDepartment);
    };

    const handleDepartmentChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const val = e.target.value;
        setFilterDepartment(val);
        applyFilter(filterMonth, val);
    };

    const exportToExcel = () => {
        // Prepare AOA (Array of Arrays) for Excel Sheet
        const aoa: any[][] = [];

        // Row 1: Header Top
        const headerRow1 = ['Tanggal'];
        employees.forEach((emp) => {
            headerRow1.push(emp.name);
            headerRow1.push(''); // Span for 2 columns
        });
        aoa.push(headerRow1);

        // Row 2: Header Sub
        const headerRow2 = [''];
        employees.forEach(() => {
            headerRow2.push('Jam Masuk');
            headerRow2.push('Jam Keluar');
        });
        aoa.push(headerRow2);

        // Data Rows
        calendar.forEach((cDay) => {
            const rowData = [cDay.date_string];
            employees.forEach((emp) => {
                const record = attendanceMap[cDay.day]?.[emp.id];
                if (!record) {
                    rowData.push('-');
                    rowData.push('-');
                } else if (record.status === 'absent') {
                    rowData.push('Absent');
                    rowData.push('-');
                } else {
                    const inStr = record.clock_in
                        ? record.clock_in.substring(11, 16)
                        : '-';
                    const outStr = record.clock_out
                        ? record.clock_out.substring(11, 16)
                        : '-';
                    const lateStr =
                        record.late_minutes > 0
                            ? ` (Telat ${record.late_minutes}m)`
                            : '';

                    rowData.push(inStr + lateStr);
                    rowData.push(outStr);
                }
            });
            aoa.push(rowData);
        });

        // Totals Row
        const totalsRow = ['Total Potongan Telat'];
        employees.forEach((emp) => {
            let totalDeduction = 0;
            calendar.forEach((cDay) => {
                const record = attendanceMap[cDay.day]?.[emp.id];
                if (record && record.late_deduction) {
                    totalDeduction += record.late_deduction;
                }
            });

            if (totalDeduction > 0) {
                totalsRow.push(
                    new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(totalDeduction),
                );
            } else {
                totalsRow.push('-');
            }
            totalsRow.push(''); // Fill empty spanned column
        });
        aoa.push(totalsRow);

        // Create Worksheet
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Merge Headers
        const merges: XLSX.Range[] = [];
        let colIndex = 1;
        employees.forEach(() => {
            merges.push({
                s: { r: 0, c: colIndex },
                e: { r: 0, c: colIndex + 1 },
            });
            colIndex += 2;
        });
        ws['!merges'] = merges;

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Absensi');

        // Write and Save
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(
            new Blob([wbout], { type: 'application/octet-stream' }),
            `Laporan_Absensi_${monthName.replace(' ', '_')}.xlsx`,
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Monthly Report - ${monthName}`} />

            <div className="m-4 flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Report</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Select Month</Label>
                            <Input
                                type="month"
                                value={filterMonth}
                                onChange={handleMonthChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <NativeSelect
                                value={filterDepartment}
                                onChange={handleDepartmentChange}
                            >
                                <NativeSelectOption value="">
                                    All Departments
                                </NativeSelectOption>
                                {departments.map((dept) => (
                                    <NativeSelectOption
                                        key={dept.id}
                                        value={dept.id}
                                    >
                                        {dept.name}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>
                            Daftar Absensi Karyawan - {monthName}
                        </CardTitle>
                        <Button
                            variant="default"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={exportToExcel}
                        >
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                    </CardHeader>
                    <CardContent className="max-w-full overflow-x-auto">
                        <Table className="min-w-max border">
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead
                                        className="border px-4 py-2 text-center align-middle"
                                        rowSpan={2}
                                    >
                                        Tanggal
                                    </TableHead>
                                    {employees.map((emp) => (
                                        <TableHead
                                            key={emp.id}
                                            className="border px-4 py-2 text-center"
                                            colSpan={2}
                                        >
                                            <div className="font-bold text-slate-800">
                                                {emp.name}
                                            </div>
                                            <div className="text-xs font-normal text-slate-500">
                                                {emp.department?.name || '-'}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-slate-50">
                                    {employees.map((emp) => (
                                        <Fragment key={`sub-${emp.id}`}>
                                            <TableHead className="w-24 border px-4 py-2 text-center text-xs">
                                                Jam Masuk
                                            </TableHead>
                                            <TableHead className="w-24 border px-4 py-2 text-center text-xs">
                                                Jam Keluar
                                            </TableHead>
                                        </Fragment>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calendar.map((cDay) => (
                                    <TableRow
                                        key={cDay.day}
                                        className={
                                            cDay.is_weekend
                                                ? 'bg-slate-100/50'
                                                : ''
                                        }
                                    >
                                        <TableCell className="min-w-[150px] border px-4 py-2 align-top whitespace-nowrap">
                                            <div className="font-medium text-slate-700">
                                                {cDay.day_name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {cDay.date_string}
                                            </div>
                                        </TableCell>

                                        {employees.map((emp) => {
                                            const record =
                                                attendanceMap[cDay.day]?.[
                                                    emp.id
                                                ];

                                            // Handle missing record
                                            if (!record) {
                                                return (
                                                    <Fragment
                                                        key={`td-${cDay.day}-${emp.id}`}
                                                    >
                                                        <TableCell className="border px-4 py-3 text-center text-slate-300">
                                                            -
                                                        </TableCell>
                                                        <TableCell className="border px-4 py-3 text-center text-slate-300">
                                                            -
                                                        </TableCell>
                                                    </Fragment>
                                                );
                                            }

                                            // Format the times
                                            const InTimeStr = record.clock_in
                                                ? record.clock_in.substring(
                                                      0,
                                                      5,
                                                  )
                                                : '-';
                                            const OutTimeStr = record.clock_out
                                                ? record.clock_out.substring(
                                                      0,
                                                      5,
                                                  )
                                                : '-';

                                            // Check lateness
                                            const InClass =
                                                record.late_minutes > 0
                                                    ? 'text-red-500 font-bold'
                                                    : 'text-slate-700 font-medium';
                                            const StatusClass =
                                                record.status === 'absent'
                                                    ? 'bg-red-50 text-red-500'
                                                    : '';

                                            return (
                                                <Fragment
                                                    key={`td-${cDay.day}-${emp.id}`}
                                                >
                                                    <TableCell
                                                        className={`border px-4 py-3 text-center ${StatusClass}`}
                                                    >
                                                        {record.status ===
                                                        'absent' ? (
                                                            <span className="text-xs font-semibold uppercase">
                                                                Absent
                                                            </span>
                                                        ) : (
                                                            <div className="whitespace-nowrap">
                                                                <span
                                                                    className={
                                                                        InClass
                                                                    }
                                                                >
                                                                    {InTimeStr}
                                                                </span>
                                                                {record.late_minutes >
                                                                    0 && (
                                                                    <span className="ml-1 text-xs font-medium text-red-500">
                                                                        (Telat{' '}
                                                                        {
                                                                            record.late_minutes
                                                                        }
                                                                        m)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`border px-4 py-3 text-center font-medium text-slate-700 ${StatusClass}`}
                                                    >
                                                        {record.status !==
                                                        'absent'
                                                            ? OutTimeStr
                                                            : '-'}
                                                    </TableCell>
                                                </Fragment>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                                {calendar.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={employees.length * 2 + 1}
                                            className="py-8 text-center text-slate-500"
                                        >
                                            No calendar data generated.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {calendar.length > 0 && (
                                    <TableRow className="bg-red-50 font-bold text-red-700">
                                        <TableCell className="border px-4 py-3 text-right">
                                            Total Potongan Telat
                                        </TableCell>
                                        {employees.map((emp) => {
                                            let total = 0;
                                            calendar.forEach((cDay) => {
                                                const record =
                                                    attendanceMap[cDay.day]?.[
                                                        emp.id
                                                    ];
                                                if (
                                                    record &&
                                                    record.late_deduction
                                                ) {
                                                    total +=
                                                        record.late_deduction;
                                                }
                                            });

                                            return (
                                                <TableCell
                                                    key={`total-${emp.id}`}
                                                    colSpan={2}
                                                    className="border px-4 py-3 text-center"
                                                >
                                                    {total > 0
                                                        ? new Intl.NumberFormat(
                                                              'id-ID',
                                                              {
                                                                  style: 'currency',
                                                                  currency:
                                                                      'IDR',
                                                              },
                                                          ).format(total)
                                                        : '-'}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
