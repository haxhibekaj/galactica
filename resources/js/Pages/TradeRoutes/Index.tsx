import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Planet, Resource, TradeRoute } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import TradeRouteForm from './TradeRouteForm';
import TradeRouteList from './TradeRouteList';

interface Props {
    tradeRoutes: TradeRoute[];
    planets: Planet[];
    resources: Resource[];
}

export default function Index({ tradeRoutes, planets, resources }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Trade Routes" />

            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Manage Trade Routes</h3>
                <Button onClick={() => setOpen(true)}>Add New Route</Button>
            </div>

            <TradeRouteList tradeRoutes={tradeRoutes} />

            {open && (
                <TradeRouteForm
                    planets={planets}
                    resources={resources}
                    open={open}
                    setOpen={setOpen}
                />
            )}
        </AuthenticatedLayout>
    );
}
