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
];

interface Product {
    id: number,
    name: string,
    price: number,
    description: string,
}

interface Props {
    product: Product
}

export default function Edit({product}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        price: product.price,
        description: product.description,
    })

    const handleSubmit  = (e: React.FormEvent) => {
        e.preventDefault()
        put(products.update.url(product.id))
    }

    return (
        <AppLayout breadcrumbs={[
            ...breadcrumbs,
            {title: 'Edit a Product', href:products.edit.url(product.id)}
        ]}>
            <Head title="Update a Product" />
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
