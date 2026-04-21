import { FaceCaptureDialog } from '@/components/FaceCaptureDialog';
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
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import AppLayout from '@/layouts/app-layout';
import employees from '@/routes/employees';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    employee: any;
    departments: { id: number; name: string }[];
}

export default function Edit() {
    const { employee, departments } = usePage<any>().props as Props;
    // Note: Use _method: 'PUT' for file uploads with Inertia as standard PUT requests don't support multipart/form-data well in some setups
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        employee_number: employee.employee_number,
        name: employee.name,
        email: employee.email ?? '',
        phone: employee.phone ?? '',
        department_id: employee.department_id ?? '',
        job_title: employee.job_title ?? '',
        contract_type: employee.contract_type ?? '',
        attendance_type: employee.attendance_type ?? '',
        contract_end_date: employee.contract_end_date ? employee.contract_end_date.split('T')[0] : '', // Get YYYY-MM-DD
        photo: null as File | null,
        face_photo: null as File | null,
        face_embedding: null as number[] | null,
        grace_period_minutes: employee.grace_period_minutes ?? '',
        is_active: !!employee.is_active,
    });

    const [isFaceCaptureOpen, setIsFaceCaptureOpen] = useState(false);

    const handleFaceCapture = (file: File, embedding: number[]) => {
        setData((data) => ({
            ...data,
            face_photo: file,
            face_embedding: embedding,
        }));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Employees',
            href: '/employees',
        },
        {
            title: 'Edit',
            href: `/employees/${employee.id}/edit`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Use post with _method: PUT
        post(employees.update.url(employee.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Employee" />
            <Card className="m-4 mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Employee</CardTitle>
                    <CardDescription>Update employee details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={submit}
                        className="space-y-4"
                        encType="multipart/form-data"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="employee_number">Employee Number</Label>
                                <Input
                                    id="employee_number"
                                    value={data.employee_number}
                                    onChange={(e) =>
                                        setData('employee_number', e.target.value)
                                    }
                                    required
                                />
                                {errors.employee_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.employee_number}
                                    </p>
                                )}
                            </div>
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
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job_title">Job Title</Label>
                                <Input
                                    id="job_title"
                                    type="text"
                                    value={data.job_title}
                                    onChange={(e) =>
                                        setData('job_title', e.target.value)
                                    }
                                />
                                {errors.job_title && (
                                    <p className="text-sm text-red-500">
                                        {errors.job_title}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="department_id">
                                    Department
                                </Label>
                                <NativeSelect
                                    id="department_id"
                                    value={data.department_id}
                                    onChange={(e) =>
                                        setData('department_id', e.target.value)
                                    }
                                >
                                    <NativeSelectOption value="">
                                        Select Department
                                    </NativeSelectOption>
                                    {departments.map((dept) => (
                                        <NativeSelectOption
                                            key={dept.id}
                                            value={dept.id}
                                        >
                                            {dept.name}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                                {errors.department_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.department_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contract_type">
                                    Contract Type
                                </Label>
                                <NativeSelect
                                    id="contract_type"
                                    value={data.contract_type}
                                    onChange={(e) =>
                                        setData('contract_type', e.target.value)
                                    }
                                >
                                    <NativeSelectOption value="">
                                        Select Contract Type
                                    </NativeSelectOption>
                                    <NativeSelectOption value="full_time">Full Time</NativeSelectOption>
                                    <NativeSelectOption value="part_time">Part Time</NativeSelectOption>
                                    <NativeSelectOption value="contract">Contract</NativeSelectOption>
                                    <NativeSelectOption value="internship">Internship</NativeSelectOption>
                                </NativeSelect>
                                {errors.contract_type && (
                                    <p className="text-sm text-red-500">
                                        {errors.contract_type}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="attendance_type">
                                    Attendance Type
                                </Label>
                                <NativeSelect
                                    id="attendance_type"
                                    value={data.attendance_type}
                                    onChange={(e) =>
                                        setData('attendance_type', e.target.value)
                                    }
                                >
                                    <NativeSelectOption value="">
                                        Select Attendance Type
                                    </NativeSelectOption>
                                    <NativeSelectOption value="onsite">On-site</NativeSelectOption>
                                    <NativeSelectOption value="remote">Remote</NativeSelectOption>
                                    <NativeSelectOption value="hybrid">Hybrid</NativeSelectOption>
                                </NativeSelect>
                                {errors.attendance_type && (
                                    <p className="text-sm text-red-500">
                                        {errors.attendance_type}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contract_end_date">
                                    Contract End Date
                                </Label>
                                <Input
                                    id="contract_end_date"
                                    type="date"
                                    value={data.contract_end_date}
                                    onChange={(e) =>
                                        setData('contract_end_date', e.target.value)
                                    }
                                />
                                {errors.contract_end_date && (
                                    <p className="text-sm text-red-500">
                                        {errors.contract_end_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="photo">Employee Photo</Label>
                                {(employee.photo) && !data.photo && (
                                    <div className="mb-2">
                                        <img
                                            src={employee.photo}
                                            alt="Current"
                                            className="h-20 w-20 rounded object-cover"
                                        />
                                    </div>
                                )}
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'photo',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                />
                                {data.photo && (
                                    <p className="mt-1 text-sm text-green-600">
                                        New photo selected.
                                    </p>
                                )}
                                {errors.photo && (
                                    <p className="text-sm text-red-500">
                                        {errors.photo}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Face Recognition</Label>
                                <div className="mb-2">
                                    {employee.photo_url && !data.photo && (
                                        <div className="mb-2">
                                            <img
                                                src={employee.photo_url}
                                                alt="Current"
                                                className="h-20 w-20 rounded object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsFaceCaptureOpen(true)}
                                    >
                                        Record New Face (Webcam)
                                    </Button>
                                    {data.face_embedding && (
                                        <span className="text-sm text-green-600">
                                            New face indexed.
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Required for clocking in via face recognition.
                                </p>
                                {errors.face_embedding && (
                                    <p className="text-sm text-red-500">
                                        {errors.face_embedding}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grace_period_minutes">
                                Override Grace Period (Minutes)
                            </Label>
                            <Input
                                id="grace_period_minutes"
                                type="number"
                                min="0"
                                value={data.grace_period_minutes}
                                onChange={(e) =>
                                    setData(
                                        'grace_period_minutes',
                                        e.target.value,
                                    )
                                }
                                placeholder="Leave empty to use global setting"
                            />
                            {errors.grace_period_minutes && (
                                <p className="text-sm text-red-500">
                                    {errors.grace_period_minutes}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked as boolean)
                                }
                            />
                            <Label htmlFor="is_active">Active Employee</Label>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Update
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <FaceCaptureDialog
                open={isFaceCaptureOpen}
                onOpenChange={setIsFaceCaptureOpen}
                onCapture={handleFaceCapture}
            />
        </AppLayout>
    );
}
