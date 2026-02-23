import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Workday {
    day: string;
    is_working: boolean;
    start_time: string;
    end_time: string;
}

interface Department {
    id: number;
    name: string;
    workdays?: Workday[];
}

interface Props {
    department: Department;
}

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export default function Edit() {
    const { department } = usePage<any>().props as Props;

    // Ensure all days are represented in workdays, even if they were saved without some days
    const initialWorkdays = DAYS_OF_WEEK.map((day) => {
        const existing = (department.workdays || []).find((w) => w.day === day);
        if (existing) return existing;
        return {
            day,
            is_working: false,
            start_time: '09:00',
            end_time: '17:00',
        };
    });

    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        workdays: Workday[];
    }>({
        name: department.name,
        workdays: initialWorkdays,
    });

    const handleWorkdayChange = (day: string, updates: Partial<Workday>) => {
        setData(
            'workdays',
            data.workdays.map((d) =>
                d.day === day ? { ...d, ...updates } : d,
            ),
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Departments',
            href: '/departments',
        },
        {
            title: 'Edit',
            href: `/departments/${department.id}/edit`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(departments.update.url(department.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Department" />
            <Card className="m-4 mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Department</CardTitle>
                    <CardDescription>
                        Update department details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label>Workdays Schedule</Label>
                            <div className="mt-2 flex flex-col gap-3 rounded-md border bg-slate-50/50 dark:bg-slate-900/50 p-4">
                                {data.workdays.map((workday) => (
                                    <div
                                        key={workday.day}
                                        className="flex flex-col gap-2 rounded border bg-white dark:bg-slate-950 p-2 sm:flex-row sm:items-center sm:gap-4"
                                    >
                                        <div className="flex w-32 items-center space-x-2">
                                            <Checkbox
                                                id={`day-${workday.day}`}
                                                checked={workday.is_working}
                                                onCheckedChange={(checked) =>
                                                    handleWorkdayChange(
                                                        workday.day,
                                                        {
                                                            is_working:
                                                                checked as boolean,
                                                        },
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`day-${workday.day}`}
                                                className="cursor-pointer text-sm leading-none font-medium"
                                            >
                                                {workday.day}
                                            </label>
                                        </div>
                                        {workday.is_working && (
                                            <div className="ml-6 flex items-center gap-2 sm:ml-0">
                                                <Input
                                                    type="time"
                                                    value={workday.start_time}
                                                    onChange={(e) =>
                                                        handleWorkdayChange(
                                                            workday.day,
                                                            {
                                                                start_time:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-8 w-32 text-xs"
                                                />
                                                <span className="text-sm text-slate-500">
                                                    to
                                                </span>
                                                <Input
                                                    type="time"
                                                    value={workday.end_time}
                                                    onChange={(e) =>
                                                        handleWorkdayChange(
                                                            workday.day,
                                                            {
                                                                end_time:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-8 w-32 text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.workdays && (
                                <p className="text-sm text-red-500">
                                    {errors.workdays}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Update
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
