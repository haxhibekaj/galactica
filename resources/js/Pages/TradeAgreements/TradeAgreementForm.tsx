import { Planet, Resource } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const formSchema = z
    .object({
        name: z.string().min(2).max(255),
        source_planet_id: z.string(),
        destination_planet_id: z.string(),
        resource_id: z.string(),
        quantity_per_cycle: z.coerce.number().min(0),
        price_per_unit: z.coerce.number().min(0),
        cycle_period: z.enum(['daily', 'weekly', 'monthly']),
        start_date: z.date(),
        status: z.enum(['active', 'pending', 'suspended', 'terminated']),
        end_date: z.date().optional(),
        terms: z.string().optional(),
    })
    .refine((data) => data.source_planet_id !== data.destination_planet_id, {
        message: 'Source and destination planets must be different',
        path: ['destination_planet_id'],
    });

interface Props {
    planets: Planet[];
    resources: Resource[];
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function TradeAgreementForm({
    planets,
    resources,
    open,
    setOpen,
}: Props) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            source_planet_id: '',
            destination_planet_id: '',
            resource_id: '',
            quantity_per_cycle: 0,
            price_per_unit: 0,
            cycle_period: 'weekly',
            start_date: new Date(),
            status: 'pending',
            terms: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(() => {
            router.post(route('trade-agreements.store'), values, {
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                },
            });
        });
    }

    const handleResourceChange = (value: string) => {
        const resource = resources.find((r) => r.id.toString() === value);
        if (resource) {
            form.setValue('price_per_unit', resource.base_price);
        }
        form.setValue('resource_id', value);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Trade Agreement</DialogTitle>
                </DialogHeader>

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
                                    <FormLabel>Agreement Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter agreement name"
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
                                name="source_planet_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source Planet</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source planet" />
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
                                        <FormLabel>
                                            Destination Planet
                                        </FormLabel>
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

                        <div className="grid grid-cols-2 gap-4">
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
                                                        {resource.name} (Base: $
                                                        {resource.base_price})
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="suspended">
                                                    Suspended
                                                </SelectItem>
                                                <SelectItem value="terminated">
                                                    Terminated
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="cycle_period"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cycle Period</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select cycle period" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="daily">
                                                Daily
                                            </SelectItem>
                                            <SelectItem value="weekly">
                                                Weekly
                                            </SelectItem>
                                            <SelectItem value="monthly">
                                                Monthly
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity_per_cycle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Quantity per Cycle
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Enter quantity"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price_per_unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price per Unit</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Enter price"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                'PPP',
                                                            )
                                                        ) : (
                                                            <span>
                                                                Pick a date
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date: Date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>
                                            End Date (Optional)
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                'PPP',
                                                            )
                                                        ) : (
                                                            <span>
                                                                Pick a date
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date: Date) =>
                                                        date <=
                                                        form.getValues(
                                                            'start_date',
                                                        )
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="terms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Terms & Conditions (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter agreement terms"
                                            className="h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Creating...' : 'Create Agreement'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
