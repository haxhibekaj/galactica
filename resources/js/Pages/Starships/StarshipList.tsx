import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Starship } from '@/types';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useTransition } from 'react';

interface Props {
    starships: Starship[];
    setStarships: (starships: Starship[]) => void;
}

export default function StarshipList({ starships, setStarships }: Props) {
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['starships'] });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const calculateProgress = (ship: Starship): number => {
        if (
            ship.status !== 'in_transit' ||
            !ship.departure_time ||
            !ship.arrival_time
        ) {
            return 0;
        }

        const departure = new Date(ship.departure_time);
        const arrival = new Date(ship.arrival_time);
        const now = new Date();

        const totalDuration = arrival.getTime() - departure.getTime();
        const elapsed = now.getTime() - departure.getTime();

        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    const getStatusBadge = (status: string, needsMaintenance: boolean) => {
        if (needsMaintenance) {
            return (
                <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                >
                    <AlertTriangle className="h-3 w-3" />
                    Maintenance Required
                </Badge>
            );
        }

        switch (status) {
            case 'in_transit':
                return <Badge variant="default">In Transit</Badge>;
            case 'maintenance':
                return <Badge variant="destructive">Under Maintenance</Badge>;
            default:
                return <Badge variant="secondary">Idle</Badge>;
        }
    };

    const handleDelete = (id: number) => {
        startTransition(() => {
            router.delete(route('starships.destroy', id), {
                onSuccess: () => {
                    setStarships(starships.filter((ship) => ship.id !== id));
                },
            });
        });
    };

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cargo Capacity</TableHead>
                        <TableHead>Current Location</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Trade Route</TableHead>
                        <TableHead>Next Maintenance</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {starships.map((ship) => (
                        <TableRow key={ship.id}>
                            <TableCell>{ship.name}</TableCell>
                            <TableCell>
                                {getStatusBadge(
                                    ship.status,
                                    ship.needsMaintenance,
                                )}
                            </TableCell>
                            <TableCell>{ship.cargo_capacity} units</TableCell>
                            <TableCell>
                                {ship.currentLocation?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                                {ship.destination?.name || 'None'}
                            </TableCell>
                            <TableCell className="w-[200px]">
                                {ship.status === 'in_transit' && (
                                    <div className="space-y-1">
                                        <Progress
                                            value={calculateProgress(ship)}
                                        />
                                        {ship.arrival_time && (
                                            <p className="text-xs text-muted-foreground">
                                                Arrival:{' '}
                                                {format(
                                                    new Date(ship.arrival_time),
                                                    'PPp',
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {ship.tradeRoute?.name || 'Unassigned'}
                            </TableCell>
                            <TableCell>
                                {ship.maintenance_due_at
                                    ? format(
                                          new Date(ship.maintenance_due_at),
                                          'PP',
                                      )
                                    : 'Not scheduled'}
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button asChild variant="ghost" size="sm">
                                    <Link
                                        href={route('starships.edit', ship.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                        isPending ||
                                        ship.status === 'in_transit'
                                    }
                                    onClick={() => handleDelete(ship.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
