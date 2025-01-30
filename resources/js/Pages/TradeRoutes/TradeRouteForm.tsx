import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Planet, Resource } from "@/types";

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
import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/Components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2).max(255),
  starting_planet_id: z.string(),
  destination_planet_id: z.string(),
  resource_id: z.string(),
}).refine(
  (data) => data.starting_planet_id !== data.destination_planet_id,
  {
    message: "Destination planet must be different from starting planet",
    path: ["destination_planet_id"],
  }
);

interface Props {
  planets: Planet[];
  resources: Resource[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function TradeRouteForm({ planets, resources, open, setOpen }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      starting_planet_id: "",
      destination_planet_id: "",
      resource_id: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      router.post(route("trade-routes.store"), values, {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
        onError: (errors) => {
          console.log(errors);
        }
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Trade Route</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter route name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="starting_planet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Planet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select starting planet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planets.map((planet) => (
                        <SelectItem key={planet.id} value={planet.id.toString()}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination planet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planets.map((planet) => (
                        <SelectItem key={planet.id} value={planet.id.toString()}>
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
              name="resource_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id.toString()}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Route"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 