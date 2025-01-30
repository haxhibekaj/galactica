import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Permission, Role } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useTransition } from 'react';
import { router } from '@inertiajs/react';

const formSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().optional(),
    permissions: z.array(z.number()).min(1, 'Select at least one permission'),
});

type FormData = z.infer<typeof formSchema>;

interface RoleFormProps {
    role: Role | null;
    permissions: Permission[];
    onClose: () => void;
}

export default function RoleForm({
    role,
    permissions,
    onClose,
}: RoleFormProps) {
    const [isPending, startTransition] = useTransition();
    
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: role?.name ?? '',
            description: role?.description ?? '',
            permissions: role?.permissions.map((p) => p.id) ?? [],
        },
    });

    const onSubmit = (values: FormData) => {
        startTransition(() => {
            if (role) {
                router.put(route('roles.update', role.id), values, {
                    onSuccess: () => onClose(),
                });
            } else {
                router.post(route('roles.store'), values, {
                    onSuccess: () => onClose(),
                });
            }
        });
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {role ? 'Edit Role' : 'Create New Role'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={role?.name === 'admin'}
                                        />
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="permissions"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Permissions</FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        {permissions.map((permission) => (
                                            <FormField
                                                key={permission.id}
                                                control={form.control}
                                                name="permissions"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(
                                                                    permission.id,
                                                                )}
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) => {
                                                                    const value =
                                                                        field.value ??
                                                                        [];
                                                                    if (
                                                                        checked
                                                                    ) {
                                                                        field.onChange(
                                                                            [
                                                                                ...value,
                                                                                permission.id,
                                                                            ],
                                                                        );
                                                                    } else {
                                                                        field.onChange(
                                                                            value.filter(
                                                                                (
                                                                                    id,
                                                                                ) =>
                                                                                    id !==
                                                                                    permission.id,
                                                                            ),
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <span className="text-sm">
                                                            {permission.name}
                                                        </span>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {role ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
