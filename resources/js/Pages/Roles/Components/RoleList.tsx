import { Role } from '@/types';
import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

interface RoleListProps {
    roles: Role[];
    onEdit: (role: Role) => void;
}

export default function RoleList({ roles, onEdit }: RoleListProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {roles.map((role) => (
                    <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.map((permission) => (
                                    <span
                                        key={permission.id}
                                        className="px-2 py-1 text-xs rounded-full"
                                    >
                                        {permission.name}
                                    </span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(role)}
                                disabled={role.name === 'admin'}
                            >
                                Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
} 