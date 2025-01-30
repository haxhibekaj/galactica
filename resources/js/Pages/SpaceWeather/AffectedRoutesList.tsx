import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Props {
    routes?: {
        id: number;
        name: string;
        starting_planet: {
            id: number;
            name: string;
        } | null;
        destination_planet: {
            id: number;
            name: string;
        } | null;
    }[];
}

export default function AffectedRoutesList({ routes = [] }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Affected Trade Routes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {routes.map((route) => (
                        <div 
                            key={route.id} 
                            className="flex items-center justify-between p-2 rounded-lg bg-muted"
                        >
                            <div className="flex items-center gap-2">
                                <span>{route.starting_planet?.name}</span>
                                <ArrowRight className="h-4 w-4" />
                                <span>{route.destination_planet?.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {route.name}
                            </span>
                        </div>
                    ))}
                    {routes.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            No routes currently affected
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 