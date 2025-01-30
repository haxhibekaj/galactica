import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Planet } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PlanetForm from './PlanetForm';
import PlanetList from './PlanetList';

interface Props {
    planets: Planet[];
}

export default function Index({ planets }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Planets" />
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Manage Planets</h3>
                <Button onClick={() => setOpen(true)}>Add New Planet</Button>
            </div>

            <PlanetList planets={planets} />

            {open && <PlanetForm open={open} setOpen={setOpen} />}
        </AuthenticatedLayout>
    );
}
