import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { useTransition } from "react";
import { Transition } from "@headlessui/react";
import { router } from "@inertiajs/react";

const formSchema = z.object({
    current_password: z.string().min(8, "Current password must be at least 8 characters."),
    password: z.string().min(8, "New password must be at least 8 characters."),
    password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
});

export default function UpdatePasswordForm({ className = "" }: { className?: string }) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            current_password: "",
            password: "",
            password_confirmation: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(() => {
            router.post(route('password.update'), values, {
                onSuccess: () => form.reset(),
            });
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium">Update Password</h2>
                <p className="mt-1 text-sm">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                    <FormField
                        control={form.control}
                        name="current_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password_confirmation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Updating..." : "Save"}
                        </Button>

                        <Transition
                            show={!isPending}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm">Saved.</p>
                        </Transition>
                    </div>
                </form>
            </Form>
        </section>
    );
}
