import { FaceCaptureDialog } from '@/components/FaceCaptureDialog';
import { IdCardModal } from '@/components/IdCardModal';
import { QrCodeCheckerDialog } from '@/components/QrCodeCheckerDialog';
import Barcode from 'react-barcode';
import TableControls from '@/components/table-controls';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge'; // Assuming Badge exists or use span
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MyPagination from '@/components/ui/my-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/lib/permissions';
import employees from '@/routes/employees';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreVertical } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

interface Employee {
    id: string;
    employee_number: string;
    name: string;
    email: string;
    phone: string;
    photo: string | null;
    department: {
        name: string;
        shift_id: number;
        shift: {
            id: number;
            name: string;
            start_time: string;
            end_time: string;
        } | null;
    } | null;
    job_title: string | null;
    photo_url: string | null;
    is_active: boolean;
    shift?: {
        name: string;
        start_time: string;
        end_time: string;
    } | null;
    grace_period_minutes?: number;
    contract_type?: string;
}

interface PageProps {
    list: any;
    q: string | null;
}

export default function Index() {
    const { scanner_type } = usePage<any>().props;
    const scannerType = scanner_type || 'barcode';
    const { can, canAny } = usePermission();
    const { list, q, flash, matched_employee } = usePage<any>()
        .props as PageProps & { flash: any; matched_employee: Employee | null };
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get('perPage') ?? '10',
    );
    const { delete: destroy } = useForm();

    const [recordingEmployeeId, setRecordingEmployeeId] = useState<
        string | null
    >(null);
    const [verifyingEmployeeId, setVerifyingEmployeeId] = useState<
        string | null
    >(null);
    const [isGlobalVerifying, setIsGlobalVerifying] = useState<boolean>(false);
    const [qrEmployee, setQrEmployee] = useState<Employee | null>(null);
    const [idCardEmployee, setIdCardEmployee] = useState<Employee | null>(null);
    const [isQrCheckerOpen, setIsQrCheckerOpen] = useState<boolean>(false);

    // For custom delete trigger
    const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(
        null,
    );
    const [deleteEmployeeName, setDeleteEmployeeName] = useState<string>('');

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleFaceCapture = (file: File, embedding: number[]) => {
        if (recordingEmployeeId !== null) {
            router.post(
                `/employees/${recordingEmployeeId}/face`,
                {
                    photo: file,
                    face_embedding: embedding,
                    _method: 'POST',
                },
                { preserveScroll: true },
            );
            setRecordingEmployeeId(null);
        }
    };

    const handleFaceVerify = (file: File, embedding: number[]) => {
        if (verifyingEmployeeId !== null) {
            router.post(
                `/employees/${verifyingEmployeeId}/verify-face`,
                {
                    face_embedding: embedding,
                    _method: 'POST',
                },
                { preserveScroll: true },
            );
            setVerifyingEmployeeId(null);
        }
    };

    const handleGlobalFaceVerify = (file: File, embedding: number[]) => {
        router.post(
            `/employees/verify-face-global`,
            {
                face_embedding: embedding,
                _method: 'POST',
            },
            { preserveScroll: true },
        );
        setIsGlobalVerifying(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            router.get(
                employees.index().url,
                { q: value, perPage: pageLength },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 500);
    };

    const handlePageLengthChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = e.target.value;
        setPageLength(value);

        router.get(
            employees.index().url,
            { q: search, perPage: value, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <Card className="m-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Employees</CardTitle>
                            <CardDescription>
                                Showing {list.from} to {list.to} of {list.total}{' '}
                                entries
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsQrCheckerOpen(true)}
                            >
                                {scannerType === 'barcode' ? 'Check Barcode' : 'Check QR Code'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsGlobalVerifying(true)}
                            >
                                Verify Face
                            </Button>
                            {can('employees.create') && (
                                <Link href={employees.create().url}>
                                    <Button>Create Employee</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TableControls
                        search={search}
                        pageLength={pageLength}
                        onSearchChange={handleSearchChange}
                        onPageLengthChange={handlePageLengthChange}
                    />
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Employee Number</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item: Employee, i: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {list.from + i}
                                        </TableCell>
                                        <TableCell>
                                            {item.photo ? (
                                                <img
                                                    src={item.photo}
                                                    alt={item.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : item.photo_url ? (
                                                <img
                                                    src={item.photo_url}
                                                    alt={item.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                                    No Img
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>{item.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-blue-600">
                                            <span
                                                style={{ cursor: item.employee_number ? 'pointer' : 'default' }}
                                                title={item.employee_number ? 'Click to copy' : undefined}
                                                onClick={() => {
                                                    if (item.employee_number) {
                                                        navigator.clipboard.writeText(item.employee_number);
                                                        toast.success("Employee number copied");
                                                    }
                                                }}
                                            >
                                                {item.employee_number ?? '-'}
                                                {item.employee_number && (
                                                    <span
                                                        className="ml-1 text-xs text-gray-400"
                                                    >
                                                        (Click to copy)
                                                    </span>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {item.department?.name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {item.job_title ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {item.department?.shift?.name ??
                                                '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {item.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    {canAny(['employees.create', 'employees.edit']) && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.get(
                                                                        employees.edit.url(
                                                                            item.id,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setRecordingEmployeeId(
                                                                        item.id,
                                                                    )
                                                                }
                                                            >
                                                                Record Face
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setVerifyingEmployeeId(
                                                                item.id,
                                                            )
                                                        }
                                                    >
                                                        Verify Face
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setQrEmployee(item)
                                                        }
                                                    >
                                                        {scannerType === 'barcode' ? 'View Barcode' : 'View QR Code'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setIdCardEmployee(item)
                                                        }
                                                    >
                                                        Download ID Card
                                                    </DropdownMenuItem>
                                                    {can('employees.delete') && (
                                                        <>
                                                        <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setDeleteEmployeeId(
                                                                        item.id,
                                                                    );
                                                                    setDeleteEmployeeName(
                                                                        item.name,
                                                                    );
                                                                }}
                                                                className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-400"
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length === 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center"
                                    >
                                        No records.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                    {list.data.length > 0 && <MyPagination data={list} />}
                </CardContent>
            </Card>

            {/* Custom dialogs for Face and Delete outside of Table */}
            <FaceCaptureDialog
                open={recordingEmployeeId !== null}
                onOpenChange={(v) => !v && setRecordingEmployeeId(null)}
                onCapture={handleFaceCapture}
            />

            <FaceCaptureDialog
                open={verifyingEmployeeId !== null}
                onOpenChange={(v) => !v && setVerifyingEmployeeId(null)}
                onCapture={handleFaceVerify}
            />

            <FaceCaptureDialog
                open={isGlobalVerifying}
                onOpenChange={(v) => setIsGlobalVerifying(v)}
                onCapture={handleGlobalFaceVerify}
            />

            <Dialog
                open={qrEmployee !== null}
                onOpenChange={(v) => !v && setQrEmployee(null)}
            >
                <DialogContent className={`flex flex-col items-center ${scannerType === 'barcode' ? 'sm:max-w-xl' : 'sm:max-w-md'}`}>
                    <DialogHeader className="w-full">
                        <DialogTitle className="text-center">
                            {scannerType === 'barcode' ? 'Barcode Attendance' : 'QR Code Attendance'}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Scan this {scannerType === 'barcode' ? 'barcode' : 'QR code'} using the attendance kiosk device
                            to clock in or out.
                        </DialogDescription>
                    </DialogHeader>
                    {qrEmployee && (
                        <div className="flex flex-col items-center justify-center space-y-6 p-6 w-full max-w-full">
                            <div className="rounded-xl border bg-white p-4 shadow-sm flex justify-center items-center overflow-hidden w-full max-w-full">
                                {scannerType === 'barcode' ? (
                                    <div className="w-full overflow-hidden flex justify-center [&>svg]:max-w-full [&>svg]:h-auto">
                                        <Barcode
                                            value={qrEmployee.employee_number}
                                            format="CODE128"
                                            displayValue={false}
                                            background="transparent"
                                            margin={0}
                                            width={1.5}
                                        />
                                    </div>
                                ) : (
                                    <QRCodeSVG
                                        value={qrEmployee.employee_number}
                                        size={250}
                                        level="H"
                                        includeMargin={true}
                                    />
                                )}
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold">
                                    {qrEmployee.name}
                                </h3>
                                <p className="text-muted-foreground">
                                    {qrEmployee.email}
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {qrEmployee.department?.name ||
                                        'No Department'}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="w-full sm:justify-center">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setQrEmployee(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <IdCardModal
                employee={idCardEmployee}
                open={idCardEmployee !== null}
                onOpenChange={(v: boolean) => !v && setIdCardEmployee(null)}
            />

            <QrCodeCheckerDialog
                open={isQrCheckerOpen}
                onOpenChange={setIsQrCheckerOpen}
            />

            <Dialog
                open={!!matched_employee}
                onOpenChange={(v) => {
                    if (!v) router.reload({ only: ['list'] });
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Face Match Found</DialogTitle>
                        <DialogDescription>
                            Employee successfully identified from facial
                            recognition.
                        </DialogDescription>
                    </DialogHeader>
                    {matched_employee && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            {matched_employee.photo ? (
                                                <img
                                                    src={matched_employee.photo}
                                                    alt={matched_employee.name}
                                                    className="h-32 w-32 rounded-full object-cover shadow-md"
                                                />
                            ) : matched_employee.photo_url ? (
                                <img
                                    src={matched_employee.photo_url}
                                    alt={matched_employee.name}
                                    className="h-32 w-32 rounded-full object-cover shadow-md"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 text-xl text-gray-500 shadow-md">
                                    No Img
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className="text-xl font-semibold">
                                    {matched_employee.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {matched_employee.email}
                                </p>
                            </div>
                            <div className="grid w-full grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Department
                                    </p>
                                    <p>
                                        {matched_employee.department?.name ??
                                            'None'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Shift
                                    </p>
                                    <p>
                                        {matched_employee.shift?.name ?? 'None'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </p>
                                    <Badge
                                        variant={
                                            matched_employee.is_active
                                                ? 'default'
                                                : 'destructive'
                                        }
                                    >
                                        {matched_employee.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Phone
                                    </p>
                                    <p>{matched_employee.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-2 sm:justify-center">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.reload({ only: ['list'] })}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteEmployeeId !== null}
                onOpenChange={(v) => !v && setDeleteEmployeeId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you really want to delete{' '}
                            <strong>{deleteEmployeeName}</strong>? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                if (deleteEmployeeId) {
                                    destroy(
                                        employees.destroy.url(deleteEmployeeId),
                                    );
                                    setDeleteEmployeeId(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
