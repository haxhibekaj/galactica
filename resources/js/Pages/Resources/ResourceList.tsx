import { Resource } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  resources: Resource[];
}

export default function ResourceList({ resources }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      startTransition(() => {
        router.delete(route("resources.destroy", id));
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell>{resource.name}</TableCell>
              <TableCell>{resource.description || "N/A"}</TableCell>
              <TableCell>${resource.base_price.toFixed(2)}</TableCell>
              <TableCell>{resource.unit}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.get(route("resources.edit", resource.id))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDelete(resource.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {resources.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No resources found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 