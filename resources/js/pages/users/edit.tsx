import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
];

interface User {
    id: number,
    name: string,
    email: string,
    role: Role
}

interface Props {
    user: User
}

interface Role {
    id: number,
    name: string,
    guard_name: string
}

interface PageProps {
    roles: Role[]
}

export default function Edit({user}: Props) {
    const { roles } = usePage().props as PageProps;
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role.id,
    })

    const roleOptions = roles.map((role) => {
        return {
            value: role.id,
            label: role.name
        }
    });

    const handleSubmit  = (e: React.FormEvent) => {
        e.preventDefault()
        put(users.update.url(user.id))
    }

    return (
        <AppLayout breadcrumbs={[
            ...breadcrumbs,
            {title: 'Edit a User', href:users.edit.url(user.id)}
        ]}>
            <Head title="Update a User" />
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
                    <div className='gap-1.5'>
                        <Label htmlFor='email'>Email</Label>
                        <Input placeholder='Enter email here...'
                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                            type="email" value={data.email}
                            onChange={(e) => setData('email', e.target.value)}></Input>
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor='role'>Role</Label>
                        <Combobox
                            options={roleOptions}
                            value={data.role}
                            onChange={(val) => setData("role", val)}
                            placeholder="Select role..."
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
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
