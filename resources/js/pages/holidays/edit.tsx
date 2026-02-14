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
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import holidays from '@/routes/holidays';

export default function Edit() {
    const { holiday } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: holiday.name,
        date: holiday.date,
        is_recurring: !!holiday.is_recurring,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Holidays',
            href: '/holidays',
        },
        {
            title: 'Edit',
            href: `/holidays/${holiday.id}/edit`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(holidays.update.url(holiday.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Holiday" />
            <Card className="m-4 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Edit Holiday</CardTitle>
                    <CardDescription>
                        Update holiday details.
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
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                required
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="is_recurring" 
                                checked={data.is_recurring}
                                onCheckedChange={(checked) => setData('is_recurring', checked as boolean)}
                            />
                            <Label htmlFor="is_recurring">Recurring (Repeat every year)</Label>
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
