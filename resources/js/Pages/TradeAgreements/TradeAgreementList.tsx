import { TradeAgreement } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { router } from "@inertiajs/react";
import { useTransition } from "react";
import { Play, Pencil, Trash2 } from "lucide-react";

interface Props {
    agreements: TradeAgreement[];
}

export default function TradeAgreementList({ agreements }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this agreement?")) {
            startTransition(() => {
                router.delete(route("trade-agreements.destroy", id));
            });
        }
    };

    const executeAgreement = (id: number) => {
        startTransition(() => {
            router.post(route("trade-agreements.execute", id));
        });
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: "bg-green-500",
            pending: "bg-yellow-500",
            suspended: "bg-red-500",
            terminated: "bg-gray-500"
        };
        return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Source Planet</TableHead>
                        <TableHead>Destination Planet</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Quantity/Cycle</TableHead>
                        <TableHead>Price/Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {agreements.map((agreement) => (
                        <TableRow key={agreement.id}>
                            <TableCell>{agreement.name}</TableCell>
                            <TableCell>{agreement.source_planet.name}</TableCell>
                            <TableCell>{agreement.destination_planet.name}</TableCell>
                            <TableCell>{agreement.resource.name}</TableCell>
                            <TableCell>{agreement.quantity_per_cycle}</TableCell>
                            <TableCell>${agreement.price_per_unit}</TableCell>
                            <TableCell>{getStatusBadge(agreement.status)}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isPending || agreement.status !== 'active'}
                                    onClick={() => executeAgreement(agreement.id)}
                                >
                                    <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.get(route("trade-agreements.edit", agreement.id))}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isPending}
                                    onClick={() => handleDelete(agreement.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 