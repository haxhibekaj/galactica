import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Resource } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ResourceForm from './ResourceForm';

interface Props {
    resources: Resource[];
}

export default function Index({ resources }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Resources" />

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Resources</h2>
                <Button onClick={() => setOpen(true)}>Add Resource</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rarity</TableHead>
                        <TableHead>Weight/Unit</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resources.map((resource) => (
                        <TableRow key={resource.id}>
                            <TableCell>{resource.name}</TableCell>
                            <TableCell>{resource.description}</TableCell>
                            <TableCell>
                                ${Number(resource.base_price).toFixed(2)}
                            </TableCell>
                            <TableCell>{resource.unit}</TableCell>
                            <TableCell>{resource.rarity}</TableCell>
                            <TableCell>
                                {Number(resource.weight_per_unit).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            route(
                                                'resources.edit',
                                                resource.id,
                                            ),
                                        )
                                    }
                                    className="mr-2"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Are you sure you want to delete this resource?',
                                            )
                                        ) {
                                            router.delete(
                                                route(
                                                    'resources.destroy',
                                                    resource.id,
                                                ),
                                            );
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {open && <ResourceForm open={open} setOpen={setOpen} />}
        </AuthenticatedLayout>
    );
}
