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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  base_price: z.number().min(0),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  weight_per_unit: z.number().min(0.1),
  unit: z.enum(['kg', 'ton', 'piece', 'liter', 'barrel']),
});

interface ResourceFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ResourceForm({ open, setOpen }: ResourceFormProps) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      base_price: 100,
      rarity: "common",
      weight_per_unit: 1,
      unit: "kg",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      ...values,
      base_price: Number(values.base_price),
      weight_per_unit: Number(values.weight_per_unit),
    };

    startTransition(() => {
      router.post(route("resources.store"), formattedValues, {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
        onError: (errors) => {
          console.error('Form submission errors:', errors);
        }
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
              name="base_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
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
              name="rarity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rarity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rarity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="barrel">Barrel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight_per_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight per Unit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Resource"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 