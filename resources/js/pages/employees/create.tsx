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
import { RequiredLabel } from '@/components/ui/required-label';
import AppLayout from '@/layouts/app-layout';
import employees from '@/routes/employees';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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
}

export default function Create() {
    const { departments } = usePage<any>().props as Props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        department_id: '',
        job_title: '',
        contract_type: '',
        attendance_type: '',
        contract_end_date: '',
        photo: null as File | null,
        face_photo: null as File | null,
        face_embedding: null as number[] | null,
        grace_period_minutes: '',
        is_active: true,
    });

    const [isFaceCaptureOpen, setIsFaceCaptureOpen] = useState(false);

    const handleFaceCapture = (file: File, embedding: number[]) => {
        setData((data) => ({
            ...data,
            face_photo: file,
            face_embedding: embedding,
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(employees.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />
            <Card className="m-4 mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Create Employee</CardTitle>
                    <CardDescription>Add a new employee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={submit}
                        className="space-y-4"
                        encType="multipart/form-data"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="name">Name</RequiredLabel>
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
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        Photo selected.
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
                                <div className="flex items-center space-x-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsFaceCaptureOpen(true)}
                                    >
                                        Record Face (Webcam)
                                    </Button>
                                    {data.face_embedding && (
                                        <span className="text-sm text-green-600">
                                            Face indexed.
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
                                Create
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
