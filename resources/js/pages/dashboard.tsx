import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatDateTime } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CalendarCheck, ClockAlert, UserCheck, Users } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        total_employees: number;
        active_employees: number;
        today_attendances: number;
        today_late: number;
    };
    recentLogs: Array<{
        id: number;
        employee: {
            name: string;
            department: { name: string } | null;
        };
        date: string;
        clock_in_time: string | null;
        clock_out_time: string | null;
        status: string;
        late_minutes: number;
    }>;
    charts: {
        by_contract: Array<{ name: string; value: number }>;
        by_attendance: Array<{ name: string; value: number }>;
    };
}

export default function Dashboard() {
    const { stats, recentLogs, charts } = usePage<any>().props as DashboardProps;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back. Here's what is happening today.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Employees
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_employees}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registered in the system
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Accounts
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_employees}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently active employees
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Today's Attendance
                            </CardTitle>
                            <CalendarCheck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.today_attendances}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Employees clocked in today
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Late Today
                            </CardTitle>
                            <ClockAlert className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.today_late}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Arrivals past grace period
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Employees by Contract Type</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
                            {charts.by_contract.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.by_contract}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {charts.by_contract.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground">No data available</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Employees by Attendance Type</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
                            {charts.by_attendance.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.by_attendance}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {charts.by_attendance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground">No data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Logs Table */}
                <Card className="flex flex-1 flex-col">
                    <CardHeader>
                        <CardTitle>Recent Clock Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead className="text-right">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLogs.length > 0 ? (
                                    recentLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {log.employee.name}
                                            </TableCell>
                                            <TableCell>
                                                {log.employee.department
                                                    ?.name || '-'}
                                            </TableCell>
                                            <TableCell>{formatDate(log.date)}</TableCell>
                                            <TableCell>
                                                {log.clock_in_time ? (
                                                    <div className="whitespace-nowrap">
                                                        <span>
                                                            {formatDateTime(log.clock_in_time)}
                                                        </span>
                                                        {log.late_minutes >
                                                            0 && (
                                                            <span className="ml-1 text-xs font-medium text-red-500">
                                                                (Telat{' '}
                                                                {
                                                                    log.late_minutes
                                                                }
                                                                m)
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {log.clock_out_time
                                                    ? formatDateTime(log.clock_out_time)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${log.status === 'on-time' ? 'bg-green-100 text-green-800' : ''} ${log.status === 'late' ? 'bg-red-100 text-red-800' : ''} ${log.status === 'absent' ? 'bg-gray-100 text-gray-800' : ''} `}
                                                >
                                                    {log.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        log.status.slice(1)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No recent attendance logs found.
                                        </TableCell>
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
