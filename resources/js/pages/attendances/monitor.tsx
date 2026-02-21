import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Real-time Monitor',
        href: '/attendance/monitor',
    },
];

interface Stats {
    total_employees: number;
    present: number;
    late: number;
    not_in: number;
}

interface Attendance {
    id: number;
    clock_in_time: string;
    status: string;
    employee: {
        name: string;
        photo_url: string | null;
        department: { name: string } | null;
        shift: { name: string } | null;
    };
}

interface NotInEmployee {
    id: number;
    name: string;
    photo_url: string | null;
    department: { name: string } | null;
    shift: { name: string } | null;
}

interface PageProps {
    stats: Stats;
    attendances: Attendance[];
    notInEmployees: NotInEmployee[];
}

export default function Monitor() {
    const { stats, attendances, notInEmployees } = usePage<any>()
        .props as PageProps;

    const refresh = () => {
        router.reload();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Real-time Monitor" />
            <div className="m-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Today's Overview
                    </h2>
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Employees
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_employees}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Present
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.present}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Late
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.late}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Not In Yet
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-500">
                                {stats.not_in}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Clock-Ins</CardTitle>
                            <CardDescription>
                                Employees who have arrived today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendances.length > 0 ? (
                                        attendances.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="flex items-center gap-2">
                                                    {item.employee.photo_url ? (
                                                        <img
                                                            src={
                                                                item.employee
                                                                    .photo_url
                                                            }
                                                            alt=""
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">
                                                            {item.employee.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                item.employee
                                                                    .department
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.clock_in_time}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs ${item.status === 'late' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center"
                                            >
                                                No one clocked in yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Not In Yet</CardTitle>
                            <CardDescription>
                                Employees expected but not yet arrived.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Shift Start</TableHead>
                                        <TableHead>Department</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notInEmployees.length > 0 ? (
                                        notInEmployees.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="flex items-center gap-2">
                                                    {item.photo_url ? (
                                                        <img
                                                            src={item.photo_url}
                                                            alt=""
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                                                    )}
                                                    <span className="font-medium">
                                                        {item.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {item.shift?.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.department?.name}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center"
                                            >
                                                Everyone is present!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
