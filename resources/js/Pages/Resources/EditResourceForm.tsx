import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { router } from "@inertiajs/react";
import { Resource } from "@/types";

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

const formSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  base_price: z.number().min(0),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  weight_per_unit: z.number().min(0.1),
  unit: z.enum(['kg', 'ton', 'piece', 'liter', 'barrel']),
});

interface Props {
  resource: Resource;
}

export default function EditResourceForm({ resource }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resource.name,
      description: resource.description || "",
      base_price: Number(resource.base_price),
      rarity: resource.rarity,
      weight_per_unit: Number(resource.weight_per_unit),
      unit: resource.unit as 'kg' | 'ton' | 'piece' | 'liter' | 'barrel',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      ...values,
      base_price: Number(values.base_price),
      weight_per_unit: Number(values.weight_per_unit),
    };

    startTransition(() => {
      router.patch(route("resources.update", resource.id), formattedValues, {
        onSuccess: () => {
          router.get(route("resources.index"));
        },
        onError: (errors) => {
          console.error('Form submission errors:', errors);
        }
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
              <FormLabel>Resource Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter resource name" {...field} />
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
                  placeholder="Enter resource description" 
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
                  min="0" 
                  step="0.01"
                  placeholder="Enter base price" 
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
          name="weight_per_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight per Unit</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0.1" 
                  step="0.01"
                  placeholder="Enter weight per unit" 
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.get(route("resources.index"))}
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