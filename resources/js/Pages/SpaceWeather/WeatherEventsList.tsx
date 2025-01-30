import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { SpaceWeather } from '@/types';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';
import { useTransition } from 'react';

interface Props {
    events: SpaceWeather[];
}

export default function WeatherEventsList({ events }: Props) {
    console.log('Events:', events);
    const [isPending, startTransition] = useTransition();
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'minor':
                return 'bg-yellow-500';
            case 'moderate':
                return 'bg-orange-500';
            case 'severe':
                return 'bg-red-500';
            case 'extreme':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatWeatherType = (type: string) => {
        return type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    const deleteWeather = (id: number) => {
        startTransition(() => {
            router.delete(`/space-weather/${id}`);
        });
    };
    return (
        <div className="space-y-4">
            {events.map((event) => (
                <Card key={event.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                {formatWeatherType(event.type)}
                            </CardTitle>
                            <Badge className={getSeverityColor(event.severity)}>
                                {event.severity.toUpperCase()}
                            </Badge>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => deleteWeather(event.id)}
                                disabled={isPending}
                            >
                                <Trash />
                            </Button>
                        </div>
                        <CardDescription>
                            Start: {new Date(event.start_time).toLocaleString()}
                            <br />
                            End: {new Date(event.end_time).toLocaleString()}
                            <br />
                            Delay Factor: {event.delay_factor?.toFixed(2) ?? 'N/A'}x
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Start: </span>
                                {format(new Date(event.start_time), 'PPp')}
                            </div>
                            <div>
                                <span className="font-medium">End: </span>
                                {format(new Date(event.end_time), 'PPp')}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {events.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                    No active weather events
                </div>
            )}
        </div>
    );
}
