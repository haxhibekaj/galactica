import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { useState } from "react";
import { router } from "@inertiajs/react";

const formSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters."),
});

export default function DeleteUserForm({ className = "" }: { className?: string }) {
    const [isPending, startTransition] = useTransition();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(() => {
            router.delete(route('profile.destroy'), {
                onSuccess: () => form.reset(),
                preserveState: true,
            });
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        form.reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium">Delete Account</h2>
                <p className="mt-1 text-sm">
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.
                </p>
            </header>

            <Button variant="destructive" onClick={() => setConfirmingUserDeletion(true)}>
                Delete Account
            </Button>

            <Dialog open={confirmingUserDeletion} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                    </DialogHeader>
                    <p className="mt-1 text-sm">
                        Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.
                    </p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="mt-6 flex justify-end">
                                <Button variant="secondary" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" type="submit" disabled={isPending} className="ms-3">
                                    {isPending ? "Deleting..." : "Delete Account"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
