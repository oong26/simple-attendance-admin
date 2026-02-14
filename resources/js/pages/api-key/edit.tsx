import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import apiKeys from '@/routes/api-keys';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'API Key',
        href: apiKeys.index.url(),
    },
];

interface ApiKey {
    id: number,
    name: string,
}

interface Props {
    apiKey: ApiKey
}

export default function Edit({apiKey}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: apiKey.name,
    })

    const handleSubmit  = (e: React.FormEvent) => {
        e.preventDefault()
        put(apiKeys.update.url(apiKey.id))
    }

    return (
        <AppLayout breadcrumbs={[
            ...breadcrumbs,
            {title: 'Edit a API Key', href: apiKeys.edit.url(apiKey.id)}
        ]}>
            <Head title="Update a API Key" />
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
