import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import apiKeys from '@/routes/api-keys';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'API Keys',
        href: apiKeys.index.url(),
    },
    {
        title: 'Create a New API Key',
        href: apiKeys.create.url(),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(apiKeys.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a API Key" />
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
                    <div className="space-x-2">
                        <Button type="submit">Add API Key</Button>
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
