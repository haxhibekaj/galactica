import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { router } from "@inertiajs/react";
import { TradeRoute, Starship } from "@/types";

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
import { Dialog } from "@/Components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  cargo_capacity: z.number().min(0),
  trade_route_id: z.string().optional(),
  status: z.enum(["idle", "in_transit", "maintenance"]),
  maintenance_due_at: z.string().optional(),
});

interface Props {
  tradeRoutes: TradeRoute[];
  open: boolean;
  setOpen: (open: boolean) => void;
  setStarships: (starships: Starship[]) => void;
}

export default function StarshipForm({ tradeRoutes, open, setOpen, setStarships }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      cargo_capacity: 0,
      trade_route_id: undefined,
      status: "idle",
      maintenance_due_at: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      router.post(route("starships.store"), values, {
        onSuccess: (page) => {
          form.reset();
          setOpen(false);
          setStarships(page.props.starships as Starship[]);
        },
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Starship</DialogTitle>
            </DialogHeader>
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
                      onChange={e => field.onChange(parseFloat(e.target.value))}
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Starship"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 