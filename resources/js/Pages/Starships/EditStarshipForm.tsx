import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { router } from "@inertiajs/react";
import { Starship, TradeRoute } from "@/types";

import { Button } from "@/Components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  cargo_capacity: z.number().min(0),
  trade_route_id: z.string().optional(),
  status: z.enum(["idle", "in_transit", "maintenance"]),
  maintenance_due_at: z.string().optional(),
});

interface Props {
  starship: Starship;
  tradeRoutes: TradeRoute[];
}

export default function EditStarshipForm({ starship, tradeRoutes }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: starship.name,
      description: starship.description || "",
      cargo_capacity: +starship.cargo_capacity,
      trade_route_id: starship.trade_route_id?.toString(),
      status: starship.status,
      maintenance_due_at: starship.maintenance_due_at ?? undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      router.patch(route("starships.update", starship.id), values, {
        onSuccess: () => {
          router.get(route("starships.index"));
        },
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starship Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter starship name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter starship description" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cargo_capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo Capacity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  placeholder="Enter cargo capacity" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trade_route_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Route</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade route" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tradeRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name} ({route.starting_planet.name} → {route.destination_planet.name})
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maintenance_due_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Due Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.get(route("starships.index"))}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 