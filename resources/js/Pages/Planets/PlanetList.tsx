import { Planet } from "@/types";
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
  planets: Planet[];
}

export default function PlanetList({ planets }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this planet?")) {
      startTransition(() => {
        router.delete(route("planets.destroy", id));
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
            <TableHead>Coordinates</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planets.map((planet) => (
            <TableRow key={planet.id}>
              <TableCell>{planet.name}</TableCell>
              <TableCell>{planet.description || "N/A"}</TableCell>
              <TableCell>{`${planet.coordinates.x}, ${planet.coordinates.y}, ${planet.coordinates.z}`}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.get(route("planets.edit", planet.id))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDelete(planet.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {planets.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No planets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 