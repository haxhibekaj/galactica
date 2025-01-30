import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { useTransition } from "react";
import { Transition } from "@headlessui/react";
import { router, usePage } from "@inertiajs/react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
});

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
    className = "",
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const user = usePage().props.auth.user;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(() => {
            router.post(route('profile.update'), values, {
                onSuccess: () => form.reset(),
            });
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium">Profile Information</h2>
                <p className="mt-1 text-sm">
                    Update your account's profile information and email address.
                </p>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="mt-2 text-sm">
                                Your email address is unverified.
                                <Button
                                    variant="link"
                                    className="text-sm underline"
                                    onClick={() => {
                                        // Handle email verification
                                        console.log("Resend verification email");
                                    }}
                                >
                                    Click here to re-send the verification email.
                                </Button>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm text-green-600">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
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
