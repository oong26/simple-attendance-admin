import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role',
        href: roles.index.url(),
    },
    {
        title: 'Create a New Role',
        href: roles.create.url(),
    },
];

interface Permission {
    id: number;
    name: string;
    action: string;
}

interface PermissionGroup {
    dashboard: Permission[];
}

interface PageProps {
    permissions: PermissionGroup[];
}

export default function Create() {
    const { permissions } = usePage().props as PageProps;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(roles.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a Role" />
            <div className="w-8/12 p-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            placeholder="Enter name here..."
                            className={
                                errors.name
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                            }
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="my-2">
                        <Label>Choose a Permissions</Label>
                    </div>
                    {Object.entries(permissions).map(([group, items]) => (
                        <Card key={group} className="p-4">
                            <Accordion type="single" collapsible>
                                <AccordionItem value={group}>
                                    <AccordionTrigger className="p-0">
                                        {(
                                            group.charAt(0).toUpperCase() +
                                            group.slice(1)
                                        )
                                            .replaceAll('-', ' ')
                                            .toUpperCase()}
                                    </AccordionTrigger>

                                    <AccordionContent className="mt-2 flex gap-5 p-0">
                                        {items.map((perm) => (
                                            <div
                                                key={perm.id}
                                                className="space-x-1.5"
                                            >
                                                <Checkbox
                                                    id={perm.name}
                                                    className="hover:cursor-pointer"
                                                    checked={data.permissions.includes(
                                                        perm.name,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        if (checked) {
                                                            setData(
                                                                'permissions',
                                                                [
                                                                    ...data.permissions,
                                                                    perm.name,
                                                                ],
                                                            );
                                                        } else {
                                                            setData(
                                                                'permissions',
                                                                data.permissions.filter(
                                                                    (p) =>
                                                                        p !==
                                                                        perm.name,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={perm.name}
                                                    className="hover:cursor-pointer"
                                                >
                                                    {perm.action
                                                        .split(' ')
                                                        .map(
                                                            (w) =>
                                                                w
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                w.slice(1),
                                                        )
                                                        .join(' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </Card>
                    ))}
                    <div className="space-x-2">
                        <Button type="submit">Add Role</Button>
                        <Button
                            type="reset"
                            variant="outline"
                            className="border-red-400 text-red-500 hover:border-red-800 hover:text-red-800"
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
