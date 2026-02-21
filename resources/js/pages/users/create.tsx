import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index.url(),
    },
    {
        title: 'Create a New User',
        href: users.create.url(),
    },
];

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface PageProps {
    roles: Role[];
}

export default function Create() {
    const { roles } = usePage().props as PageProps;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: '',
    });

    const roleOptions = roles.map((role) => {
        return {
            value: role.id,
            label: role.name,
        };
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(users.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a User" />
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
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            placeholder="Enter email here..."
                            className={
                                errors.email
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                            }
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        ></Input>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="role">Role</Label>
                        <Combobox
                            options={roleOptions}
                            value={data.role}
                            onChange={(val) => setData('role', val)}
                            placeholder="Select role..."
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div className="space-x-2">
                        <Button type="submit">Add User</Button>
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
