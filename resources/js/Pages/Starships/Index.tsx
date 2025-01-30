import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Starship, TradeRoute } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import StarshipForm from './StarshipForm';
import StarshipList from './StarshipList';

interface Props {
    starships: Starship[];
    tradeRoutes: TradeRoute[];
}

export default function Index({ starships: initialStarships = [], tradeRoutes }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [starships, setStarships] = useState(initialStarships);

    return (
        <AuthenticatedLayout>
            <Head title="Starship Fleet" />

            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Manage Fleet</h3>
                <Button onClick={() => setIsFormOpen(true)}>
                    Add New Starship
                </Button>
            </div>

            <StarshipList starships={starships} setStarships={setStarships} />

            {isFormOpen && (
                <StarshipForm
                    tradeRoutes={tradeRoutes}
                    open={isFormOpen}
                    setOpen={setIsFormOpen}
                    setStarships={setStarships}
                />
            )}
        </AuthenticatedLayout>
    );
}
