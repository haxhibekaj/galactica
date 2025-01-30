import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Starship, TradeRoute } from '@/types';
import { Head } from '@inertiajs/react';
import EditStarshipForm from './EditStarshipForm';

interface Props {
    starship: Starship;
    tradeRoutes: TradeRoute[];
}

export default function Edit({ starship, tradeRoutes }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Edit Starship" />
            <EditStarshipForm starship={starship} tradeRoutes={tradeRoutes} />
        </AuthenticatedLayout>
    );
}
