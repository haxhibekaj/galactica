import { TradeRoute } from "@/types";
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
  tradeRoutes: TradeRoute[];
}

export default function TradeRouteList({ tradeRoutes }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
      startTransition(() => {
        router.delete(route("trade-routes.destroy", id));
      });
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Starting Planet</TableHead>
            <TableHead>Destination Planet</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Travel Time (hours)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tradeRoutes.map((tradeRoute) => (
            <TableRow key={tradeRoute.id}>
              <TableCell>{tradeRoute.name}</TableCell>
              <TableCell>{tradeRoute.starting_planet.name}</TableCell>
              <TableCell>{tradeRoute.destination_planet.name}</TableCell>
              <TableCell>{tradeRoute.resource.name}</TableCell>
              <TableCell>{tradeRoute.travel_time}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.get(route("trade-routes.edit", tradeRoute.id))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDelete(tradeRoute.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {tradeRoutes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No trade routes found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 