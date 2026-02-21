import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import attendances from '@/routes/attendances';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: attendances.index.url(),
    },
    {
        title: 'Create Leave Request',
        href: attendances.create.url(),
    },
];

interface Employee {
    id: string;
    name: string;
}

interface Holiday {
    date: string;
    name: string;
}

interface PageProps {
    employees: Employee[];
    holidays: Holiday[];
}

export default function Leave() {
    const { employees, holidays } = usePage().props as PageProps;
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        employee_id: '',
        date: '',
        note: '',
    });

    const employeeOptions = employees.map((employee) => ({
        value: employee.id.toString(),
        label: employee.name,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const holiday = holidays?.find(h => h.date === data.date);
        if (holiday) {
            setError('date', `Cannot request leave on a holiday: ${holiday.name}`);
            return;
        }

        post(attendances.storeLeave.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Leave Request" />
            <div className="w-full md:w-8/12 p-4">
                <form className="space-y-4 rounded bg-white p-6 shadow dark:bg-zinc-900" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Leave Request Form</h2>
                    
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="employee_id">Employee</Label>
                        <Combobox
                            options={employeeOptions}
                            value={data.employee_id}
                            onChange={(val) => setData('employee_id', val)}
                            placeholder="Select employee..."
                        />
                        {errors.employee_id && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.employee_id}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            className={
                                errors.date
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                            }
                            value={data.date}
                            onChange={(e) => {
                                const val = e.target.value;
                                setData('date', val);
                                const holiday = holidays?.find(h => h.date === val);
                                if (holiday) {
                                    setError('date', `Selected date is a holiday: ${holiday.name}`);
                                } else {
                                    clearErrors('date');
                                }
                            }}
                        />
                        {errors.date && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.date}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="note">Note</Label>
                        <Textarea
                            id="note"
                            placeholder="Enter the reason for leave..."
                            className={
                                errors.note
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                            }
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            rows={4}
                        />
                        {errors.note && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.note}
                            </p>
                        )}
                    </div>

                    <div className="space-x-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
