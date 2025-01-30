import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Planet, Resource, TradeRoute } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/Components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

const formSchema = z
    .object({
        name: z.string().min(2).max(255),
        starting_planet_id: z.string(),
        destination_planet_id: z.string(),
        resource_id: z.string(),
        travel_time: z.number().min(1),
    })
    .refine((data) => data.starting_planet_id !== data.destination_planet_id, {
        message: 'Starting and destination planets must be different',
        path: ['destination_planet_id'],
    });

interface Props {
    tradeRoute: TradeRoute;
    planets: Planet[];
    resources: Resource[];
}

export default function Edit({ tradeRoute, planets, resources }: Props) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: tradeRoute.name,
            starting_planet_id: tradeRoute.starting_planet_id.toString(),
            destination_planet_id: tradeRoute.destination_planet_id.toString(),
            resource_id: tradeRoute.resource_id.toString(),
            travel_time: tradeRoute.travel_time,
        },
    });

    // Calculate travel time based on 3D coordinates
    const calculateTravelTime = (
        startPlanetId: string,
        destPlanetId: string,
    ) => {
        const startPlanet = planets.find(
            (p) => p.id.toString() === startPlanetId,
        );
        const destPlanet = planets.find(
            (p) => p.id.toString() === destPlanetId,
        );

        if (!startPlanet || !destPlanet) return 0;

        // Calculate 3D Euclidean distance
        const distance = Math.sqrt(
            Math.pow(destPlanet.coordinates.x - startPlanet.coordinates.x, 2) +
                Math.pow(
                    destPlanet.coordinates.y - startPlanet.coordinates.y,
                    2,
                ) +
                Math.pow(
                    destPlanet.coordinates.z - startPlanet.coordinates.z,
                    2,
                ),
        );

        // Convert distance to travel time (hours)
        return Math.ceil(distance);
    };

    // Update travel time when planets change
    useEffect(() => {
        const startId = form.getValues('starting_planet_id');
        const destId = form.getValues('destination_planet_id');

        if (startId && destId) {
            const travelTime = calculateTravelTime(startId, destId);
            form.setValue('travel_time', travelTime);
        }
    }, [form.watch('starting_planet_id'), form.watch('destination_planet_id')]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(() => {
            router.put(route('trade-routes.update', tradeRoute.id), values);
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Edit Trade Route" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Route Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter route name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="starting_planet_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Starting Planet</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select starting planet" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {planets.map((planet) => (
                                                <SelectItem
                                                    key={planet.id}
                                                    value={planet.id.toString()}
                                                >
                                                    {planet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="destination_planet_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination Planet</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination planet" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {planets.map((planet) => (
                                                <SelectItem
                                                    key={planet.id}
                                                    value={planet.id.toString()}
                                                >
                                                    {planet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="resource_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resource</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select resource" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {resources.map((resource) => (
                                            <SelectItem
                                                key={resource.id}
                                                value={resource.id.toString()}
                                            >
                                                {resource.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="travel_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Estimated Travel Time (hours)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                parseInt(e.target.value),
                                            )
                                        }
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.get(route('trade-routes.index'))
                            }
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Form>
        </AuthenticatedLayout>
    );
}
