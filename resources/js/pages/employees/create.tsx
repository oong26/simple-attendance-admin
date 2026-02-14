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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import employees from '@/routes/employees';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
    {
        title: 'Create',
        href: '/employees/create',
    },
];

interface Props {
    departments: { id: number; name: string }[];
    shifts: { id: number; name: string }[];
}

export default function Create() {
    const { departments, shifts } = usePage<any>().props as Props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        department_id: '',
        shift_id: '',
        photo: null as File | null,
        grace_period_minutes: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(employees.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />
            <Card className="m-4 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Employee</CardTitle>
                    <CardDescription>
                        Add a new employee.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department</Label>
                                <NativeSelect
                                    id="department_id"
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                >
                                    <NativeSelectOption value="">Select Department</NativeSelectOption>
                                    {departments.map((dept) => (
                                        <NativeSelectOption key={dept.id} value={dept.id}>{dept.name}</NativeSelectOption>
                                    ))}
                                </NativeSelect>
                                {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shift_id">Shift</Label>
                                <NativeSelect
                                    id="shift_id"
                                    value={data.shift_id}
                                    onChange={(e) => setData('shift_id', e.target.value)}
                                >
                                    <NativeSelectOption value="">Select Shift</NativeSelectOption>
                                    {shifts.map((shift) => (
                                        <NativeSelectOption key={shift.id} value={shift.id}>{shift.name}</NativeSelectOption>
                                    ))}
                                </NativeSelect>
                                {errors.shift_id && <p className="text-sm text-red-500">{errors.shift_id}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.photo && <p className="text-sm text-red-500">{errors.photo}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grace_period_minutes">Override Grace Period (Minutes)</Label>
                            <Input
                                id="grace_period_minutes"
                                type="number"
                                min="0"
                                value={data.grace_period_minutes}
                                onChange={(e) => setData('grace_period_minutes', e.target.value)}
                                placeholder="Leave empty to use global setting"
                            />
                            {errors.grace_period_minutes && <p className="text-sm text-red-500">{errors.grace_period_minutes}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="is_active" 
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                            />
                            <Label htmlFor="is_active">Active Employee</Label>
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
