import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import products from '@/routes/products';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: products.index.url(),
    },
    {
        title: 'Create a New Product',
        href: products.create.url(),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
        description: '',
    })

    const handleSubmit  = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(data);
        post(products.store.url())
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a Product" />
            <div className='w-8/12 p-4'>
                <form className='space-y-4' onSubmit={handleSubmit}>
                    <div className='gap-1.5'>
                        <Label htmlFor='name'>Product Name</Label>
                        <Input placeholder='Enter product name here...'
                            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}></Input>
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor='price'>Product Price</Label>
                        <Input placeholder='Enter product price here...'
                            className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}></Input>
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                        )}
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor='description'>Product Description</Label>
                        <Textarea placeholder='Enter product description here...'
                            className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}></Textarea>
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>
                    <div className='space-x-2'>
                        <Button type="submit">Add Product</Button>
                        <Button type="reset" variant="outline"
                            className="border-red-400 text-red-500 hover:text-red-800 hover:border-red-800"
                            >Reset</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
