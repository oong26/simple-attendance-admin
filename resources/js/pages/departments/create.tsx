import LocationPicker from '@/components/map/location-picker';
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
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: '/departments',
    },
    {
        title: 'Create',
        href: '/departments/create',
    },
];

interface Props {}

interface Workday {
    day: string;
    is_working: boolean;
    start_time: string;
    end_time: string;
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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        workdays: Workday[];
        lat: string;
        long: string;
        attendance_radius: number;
    }>({
        name: '',
        lat: '',
        long: '',
        attendance_radius: 5,
        workdays: DAYS_OF_WEEK.map((day) => ({
            day,
            is_working: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
            ].includes(day),
            start_time: '09:00',
            end_time: '17:00',
        })),
    });

    const handleWorkdayChange = (day: string, updates: Partial<Workday>) => {
        setData(
            'workdays',
            data.workdays.map((d) =>
                d.day === day ? { ...d, ...updates } : d,
            ),
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(departments.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Department" />
            <Card className="m-4 mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Create Department</CardTitle>
                    <CardDescription>
                        Add a new department to the system.
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

                        <div className="space-y-3">
                            <Label>Branch Location (Select on map)</Label>

                            <LocationPicker
                                lat={data.lat ? parseFloat(data.lat) : null}
                                long={data.long ? parseFloat(data.long) : null}
                                radius={data.attendance_radius}
                                onChange={(pos) => {
                                    setData((prev) => ({
                                        ...prev,
                                        lat: pos.lat.toString(),
                                        long: pos.long.toString(),
                                    }));
                                }}
                            />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Latitude</Label>
                                    <Input
                                        value={data.lat}
                                        readOnly
                                        className={
                                            errors.lat
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Longitude</Label>
                                    <Input
                                        value={data.long}
                                        readOnly
                                        className={
                                            errors.long
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                </div>
                            </div>

                            {(errors.lat || errors.long) && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.lat || errors.long}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="attendance_radius">
                                Attendance Radius (meters)
                            </Label>
                            <Input
                                id="attendance_radius"
                                type="number"
                                min="1"
                                value={data.attendance_radius}
                                onChange={(e) =>
                                    setData(
                                        'attendance_radius',
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                required
                            />
                            <p className="text-xs text-slate-500">
                                Distance in meters from the department location where attendance is allowed.
                            </p>
                            {errors.attendance_radius && (
                                <p className="text-sm text-red-500">
                                    {errors.attendance_radius}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Create
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
