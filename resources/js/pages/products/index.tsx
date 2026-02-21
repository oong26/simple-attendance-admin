import DeleteDialog from '@/components/delete-dialog';
import TableControls from '@/components/table-controls';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import products from '@/routes/products';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: products.index().url,
    },
];

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
}

interface LinkProps {
    active: boolean;
    label: string;
    page: number;
    url: string;
}

interface ProductPagination {
    data: Product[];
    links: LinkProps[];
    from: number;
    to: number;
}

interface PageProps {
    list: ProductPagination;
    q: string | null;
}

export default function Index() {
    const { list, q } = usePage().props as PageProps;
    const [search, setSearch] = useState(q ?? '');
    const [pageLength, setPageLength] = useState(
        new URLSearchParams(window.location.search).get('perPage') ?? '10',
    );
    const { processing, delete: destroy } = useForm();
    const { can, canAny } = usePermission();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout (delay for 500 milliseconds)
        timeoutRef.current = setTimeout(() => {
            router.get(
                '',
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
            '',
            { q: search, perPage: value, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>List</CardTitle>
                    <CardDescription>
                        Showing {list.from} to {list.to} of {list.total} entries
                    </CardDescription>
                    <CardAction>
                        {can('products.create') && (
                            <Link href={products.create()}>
                                <Button>Create a product</Button>
                            </Link>
                        )}
                    </CardAction>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Price</TableHead>
                                {(can('products.delete') ||
                                    can('products.edit')) && (
                                    <TableHead className="text-center">
                                        Action
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        {list.data.length > 0 && (
                            <TableBody>
                                {list.data.map((item, i) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {list.from + i}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell
                                            className="max-w-xs truncate"
                                            title={item.description}
                                        >
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${item.price}
                                        </TableCell>
                                        {canAny([
                                            'products.delete',
                                            'products.edit',
                                        ]) && (
                                            <TableCell className="space-x-2 text-center">
                                                {can('products.delete') && (
                                                    <DeleteDialog
                                                        itemName={item.name}
                                                        onConfirm={() =>
                                                            destroy(
                                                                products.destroy.url(
                                                                    item.id,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                )}
                                                {can('products.edit') && (
                                                    <Link
                                                        href={products.edit.url(
                                                            item.id,
                                                        )}
                                                    >
                                                        <Button className="bg-primary text-white dark:text-black">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                        {list.data.length == 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            canAny([
                                                'products.delete',
                                                'products.edit',
                                            ])
                                                ? 5
                                                : 4
                                        }
                                        className="text-center"
                                    >
                                        No records.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                    {/* Pagination */}
                    {list.data.length > 0 && <MyPagination data={list} />}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
