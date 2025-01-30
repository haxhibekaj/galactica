import { Button } from '@/Components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters.'),
        email: z.string().email('Please enter a valid email address.'),
        password: z.string().min(8, 'Password must be at least 8 characters.'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match.',
        path: ['password_confirmation'],
    });

export default function Register() {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(() => {
            router.post(route('register'), values, {
                onSuccess: () => form.reset(),
            });
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

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

                    <div className="mt-4 flex items-center justify-end">
                        <Link
                            href={route('login')}
                            className="text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            Already registered?
                        </Link>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="ml-4"
                        >
                            {isPending ? 'Registering...' : 'Register'}
                        </Button>
                    </div>
                </form>
            </Form>
        </GuestLayout>
    );
}
