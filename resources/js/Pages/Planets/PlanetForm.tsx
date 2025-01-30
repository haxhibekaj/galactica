import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { router } from "@inertiajs/react";

import { Button } from "@/Components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/Components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  color: z.string().optional()
});

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PlanetForm({ open, setOpen }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      coordinates: {
        x: 0,
        y: 0,
        z: 0
      },
      color: "#1a73e8"
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      router.post(route("planets.store"), values, {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      });
    });
  }

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Planet</DialogTitle>
      </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planet Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter planet name" {...field} />
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
                      placeholder="Enter planet description" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="coordinates.x"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X Coordinate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
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
                name="coordinates.y"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Y Coordinate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
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
                name="coordinates.z"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Z Coordinate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Planet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 