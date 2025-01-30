import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SpaceWeather, TradeRoute } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useTransition } from 'react';
import AffectedRoutesList from './AffectedRoutesList';
import WeatherEventsList from './WeatherEventsList';

interface Props {
    weatherEvents: SpaceWeather[];
    affectedRoutes: TradeRoute[];
}

export default function Index({ weatherEvents, affectedRoutes }: Props) {
    console.log('Weather Events:', weatherEvents);
    console.log('Affected Routes:', affectedRoutes);

    const [isPending, startTransition] = useTransition();

    const generateWeather = () => {
        startTransition(() => {
            router.post('/space-weather/generate');
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Space Weather" />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Active Weather Events</h3>
                <Button onClick={generateWeather} disabled={isPending}>
                    Generate Weather Event
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <WeatherEventsList events={weatherEvents} />
                <AffectedRoutesList routes={affectedRoutes} />
            </div>
        </AuthenticatedLayout>
    );
}
