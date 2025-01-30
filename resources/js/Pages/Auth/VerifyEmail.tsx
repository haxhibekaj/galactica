import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, router } from "@inertiajs/react";
import { useTransition } from "react";

const formSchema = z.object({
    verification_code: z.string().min(6, "Verification code must be 6 characters."),
});

export default function VerifyEmail() {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            verification_code: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(() => {
            router.post(route('verification.verify'), values, {
                onSuccess: () => form.reset(),
            });
        });
    };

    return (
        <GuestLayout>
            <Head title="Verify Email" />

            <div className="mb-4 text-sm text-gray-400">
                Thanks for signing up! Before getting started, could you verify your email address by
                entering the code we just emailed to you?
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="verification_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="mt-4 flex items-center justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Verifying..." : "Verify Email"}
                        </Button>
                    </div>
                </form>
            </Form>
        </GuestLayout>
    );
} 