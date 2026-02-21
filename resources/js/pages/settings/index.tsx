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
import AppLayout from '@/layouts/app-layout';
import settingsRoutes from '@/routes/settings';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
];

export default function Index() {
    const { settings } = usePage<any>().props;
    const { data, setData, post, processing, errors } = useForm({
        global_grace_period: settings.global_grace_period ?? '0',
        late_deduction_per_minute: settings.late_deduction_per_minute ?? '0',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(settingsRoutes.update().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Settings" />
            <Card className="m-4 mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Attendance Settings</CardTitle>
                    <CardDescription>
                        Configure global settings for attendance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="global_grace_period">
                                Global Grace Period (Minutes)
                            </Label>
                            <Input
                                id="global_grace_period"
                                type="number"
                                min="0"
                                value={data.global_grace_period}
                                onChange={(e) =>
                                    setData(
                                        'global_grace_period',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                This grace period applies to all employees
                                unless overridden in their profile.
                            </p>
                            {errors.global_grace_period && (
                                <p className="text-sm text-red-500">
                                    {errors.global_grace_period}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="late_deduction_per_minute">
                                Late Deduction Per Minute (IDR)
                            </Label>
                            <Input
                                id="late_deduction_per_minute"
                                type="number"
                                min="0"
                                value={data.late_deduction_per_minute}
                                onChange={(e) =>
                                    setData(
                                        'late_deduction_per_minute',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                E.g., setting this to 1000 means an employee 15m
                                late will be deducted Rp 15.000,00.
                            </p>
                            {errors.late_deduction_per_minute && (
                                <p className="text-sm text-red-500">
                                    {errors.late_deduction_per_minute}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Save Settings
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
