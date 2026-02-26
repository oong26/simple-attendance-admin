import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import attendances from '@/routes/attendances';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { RequiredLabel } from '@/components/ui/required-label';

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
        leave_type: '',
        note: '',
        is_arrive_late: false,
    });

    const employeeOptions = employees.map((employee) => ({
        value: employee.id.toString(),
        label: employee.name,
    }));

    const leaveTypeOptions = [
        { value: 'cuti', label: 'Cuti' },
        { value: 'izin', label: 'Izin' },
    ];

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
            <div className="w-full md:w-6/12 p-4">
                <form className="space-y-4 rounded bg-white p-6 shadow dark:bg-zinc-900" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Leave Request Form</h2>
                    
                    <div className="flex flex-col gap-1.5">
                        <RequiredLabel htmlFor="employee_id">Employee</RequiredLabel>
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
                        <RequiredLabel htmlFor="leave_type">Leave Type</RequiredLabel>
                        <Combobox
                            options={leaveTypeOptions}
                            value={data.leave_type}
                            onChange={(val) => setData('leave_type', val)}
                            placeholder="Select leave type..."
                        />
                        {errors.leave_type && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.leave_type}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <RequiredLabel htmlFor="date">Date</RequiredLabel>
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

                    <div className="flex items-center space-x-2 pt-2 pb-2">
                        <Checkbox 
                            id="is_arrive_late" 
                            checked={data.is_arrive_late}
                            onCheckedChange={(checked) => setData('is_arrive_late', checked as boolean)}
                        />
                        <Label
                            htmlFor="is_arrive_late"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Arrive Late
                        </Label>
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
