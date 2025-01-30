import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Planet } from '@/types';
import { Head } from '@inertiajs/react';
import EditPlanetForm from './EditPlanetForm';

interface Props {
    planet: Planet;
}

export default function Edit({ planet }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Edit Planet" />

            <EditPlanetForm planet={planet} />
        </AuthenticatedLayout>
    );
}
