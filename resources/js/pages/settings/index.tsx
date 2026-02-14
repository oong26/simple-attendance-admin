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
import settingsRoutes from '@/routes/settings';

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
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(settingsRoutes.update().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Settings" />
            <Card className="m-4 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Attendance Settings</CardTitle>
                    <CardDescription>
                        Configure global settings for attendance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="global_grace_period">Global Grace Period (Minutes)</Label>
                            <Input
                                id="global_grace_period"
                                type="number"
                                min="0"
                                value={data.global_grace_period}
                                onChange={(e) => setData('global_grace_period', e.target.value)}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                This grace period applies to all employees unless overridden in their profile.
                            </p>
                            {errors.global_grace_period && <p className="text-sm text-red-500">{errors.global_grace_period}</p>}
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
