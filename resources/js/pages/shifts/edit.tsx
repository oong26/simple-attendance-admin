import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import shifts from '@/routes/shifts';

export default function Edit() {
    const { shift } = usePage<any>().props;
    // Format time to HH:MM if it comes as H:i:s
    const formatTime = (time: string) => time ? time.substring(0, 5) : '';

    const { data, setData, put, processing, errors } = useForm({
        name: shift.name,
        start_time: formatTime(shift.start_time),
        end_time: formatTime(shift.end_time),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Shifts',
            href: '/shifts',
        },
        {
            title: 'Edit',
            href: `/shifts/${shift.id}/edit`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(shifts.update.url(shift.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Shift" />
            <Card className="m-4 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Edit Shift</CardTitle>
                    <CardDescription>
                        Update shift details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    required
                                />
                                {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    required
                                />
                                {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                            </div>
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
