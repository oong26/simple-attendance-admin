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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Late Deductions',
        href: '/late-deductions',
    },
];

interface LateDeductionRule {
    id: number;
    type: string;
    amount_per_minute: number;
    is_active: boolean;
    created_at: string;
}

export default function Index() {
    const { rules } = usePage<any>().props as { rules: LateDeductionRule[] };
    const { data, setData, post, processing, reset, errors } = useForm({
        amount_per_minute: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/late-deductions', {
            onSuccess: () => reset(),
        });
    };

    const toggleActive = (rule: LateDeductionRule, checked: boolean) => {
        router.put(
            `/late-deductions/${rule.id}`,
            {
                amount_per_minute: rule.amount_per_minute,
                is_active: checked,
            },
            { preserveScroll: true },
        );
    };

    const deleteRule = (id: number) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            router.delete(`/late-deductions/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Late Deductions" />
            <div className="m-4 flex flex-col gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Late Deduction Rules</CardTitle>
                            <CardDescription>
                                Manage the historical IDR rates for late
                                attendance deductions. Only one rule can be
                                active.
                            </CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Rule
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Add New Deduction Rule
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount_per_minute">
                                            Amount Per Minute (IDR)
                                        </Label>
                                        <Input
                                            id="amount_per_minute"
                                            type="number"
                                            min="0"
                                            value={data.amount_per_minute}
                                            onChange={(e) =>
                                                setData(
                                                    'amount_per_minute',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.amount_per_minute && (
                                            <p className="text-sm text-red-500">
                                                {errors.amount_per_minute}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData('is_active', checked)
                                            }
                                        />
                                        <Label htmlFor="is_active">
                                            Set as Active immediately
                                        </Label>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount (IDR)</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-center">
                                        Active
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow
                                        key={rule.id}
                                        className={
                                            rule.is_active ? 'bg-green-50' : ''
                                        }
                                    >
                                        <TableCell className="capitalize">
                                            {rule.type.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(rule.amount_per_minute)}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                rule.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={rule.is_active}
                                                onCheckedChange={(checked) =>
                                                    toggleActive(rule, checked)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    deleteRule(rule.id)
                                                }
                                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {rules.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center"
                                        >
                                            No rules found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
