import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Permission, Role } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import RoleForm from './Components/RoleForm';
import RoleList from './Components/RoleList';

interface RolesPageProps extends PageProps {
    roles: Role[];
    permissions: Permission[];
}

export default function Index({ auth, roles, permissions }: RolesPageProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    return (
        <AuthenticatedLayout>
            <Head title="Role Management" />
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Role Management</h2>
                    <Button
                        onClick={() => {
                            setEditingRole(null);
                            setIsFormOpen(true);
                        }}
                    >
                        Create New Role
                    </Button>
                </div>

                <RoleList
                    roles={roles}
                    onEdit={(role) => {
                        setEditingRole(role);
                        setIsFormOpen(true);
                    }}
                />

                {isFormOpen && (
                    <RoleForm
                        role={editingRole}
                        permissions={permissions}
                        onClose={() => {
                            setIsFormOpen(false);
                            setEditingRole(null);
                        }}
                    />
                )}
        </AuthenticatedLayout>
    );
}
