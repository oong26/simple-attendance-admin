import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import apiKeys from '@/routes/api-keys';
import roles from '@/routes/roles';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';
import { permission } from 'process';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'API Key',
        href: apiKeys.index.url(),
    },
];

interface Role {
    id: number,
    name: string,
    permissions: Permission[]
}

interface Permission {
    id: number,
    name: string,
    guard_name: string,
}

interface PermissionItem {
    id: number,
    name: string,
    action: string
}

interface PermissionGroup {
    dashboard: PermissionItem[]
}

interface Props {
    role: Role
}

interface PageProps {
    permissions: PermissionGroup[]
}

export default function Edit({role}: Props) {
    const {permissions} = usePage().props as PageProps;
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions.map((perm) => perm.name)
    })

    const handleSubmit  = (e: React.FormEvent) => {
        e.preventDefault()
        put(roles.update.url(role.id))
    }

    return (
        <AppLayout breadcrumbs={[
            ...breadcrumbs,
            {title: 'Edit a Role', href: roles.edit.url(role.id)}
        ]}>
            <Head title="Update a Role" />
            <div className='w-8/12 p-4'>
                <form className='space-y-4' onSubmit={handleSubmit}>
                    <div className='gap-1.5'>
                        <Label htmlFor='name'>Name</Label>
                        <Input placeholder='Enter name here...'
                            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}></Input>
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>
                    {Object.entries(permissions).map(([group, items]) => {
                        const shouldOpen = items.some(perm => data.permissions.includes(perm.name));

                        return (
                            <Card key={group} className="p-4">
                                <Accordion type="single" collapsible
                                    value={shouldOpen ? group : undefined}>
                                    <AccordionItem value={group}>
                                        
                                        <AccordionTrigger className="p-0">
                                            {(group.charAt(0).toUpperCase() + group.slice(1)).replaceAll('-', ' ').toUpperCase()}
                                        </AccordionTrigger>
                                        
                                        <AccordionContent className="p-0 mt-2 flex gap-5">
                                            {items.map((perm) => (
                                                <div key={perm.id} className="space-x-1.5">
                                                    <Checkbox
                                                        id={perm.name}
                                                        className="hover:cursor-pointer"
                                                        checked={data.permissions.includes(perm.name)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setData('permissions', [...data.permissions, perm.name]);
                                                            } else {
                                                                setData(
                                                                    'permissions',
                                                                    data.permissions.filter((p) => p !== perm.name)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={perm.name} className="hover:cursor-pointer">
                                                        {perm.action
                                                            .split(' ')
                                                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                                            .join(' ')
                                                        }
                                                    </Label>
                                                </div>
                                            ))}
                                        </AccordionContent>

                                    </AccordionItem>
                                </Accordion>
                            </Card>
                        );
                    })}
                    <div className='space-x-2'>
                        <Button type="submit">Save</Button>
                        <Button type="reset" variant="outline"
                            className="border-red-400 text-red-500 hover:text-red-800 hover:border-red-800"
                            >Reset</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
