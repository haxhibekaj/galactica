import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Resource } from '@/types';
import { Head } from '@inertiajs/react';
import EditResourceForm from './EditResourceForm';

interface Props {
    resource: Resource;
}

export default function Edit({ resource }: Props) {
    console.log('Resource in Edit component:', resource); // Debug log

    return (
        <AuthenticatedLayout>
            <Head title="Edit Resource" />

                <EditResourceForm resource={resource} />
        </AuthenticatedLayout>
    );
}
