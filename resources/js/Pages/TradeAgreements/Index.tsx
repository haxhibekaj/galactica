import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Planet, Resource, TradeAgreement } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useTransition } from 'react';
import TradeAgreementForm from './TradeAgreementForm';
import TradeAgreementList from './TradeAgreementList';

interface Props {
    agreements: TradeAgreement[];
    planets: Planet[];
    resources: Resource[];
}

export default function Index({ agreements, planets, resources }: Props) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const processAllAgreements = () => {
        if (confirm('Process all active trade agreements?')) {
            startTransition(() => {
                router.post(route('trade-agreements.process-all'));
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Trade Agreements" />

            <div className="flex justify-between">
                <Button
                    variant="secondary"
                    onClick={processAllAgreements}
                    disabled={isPending}
                >
                    Process All Agreements
                </Button>
                <Button onClick={() => setOpen(true)}>Create Agreement</Button>
            </div>

            <TradeAgreementList agreements={agreements} />

            {open && (
                <TradeAgreementForm
                    planets={planets}
                    resources={resources}
                    open={open}
                    setOpen={setOpen}
                />
            )}
        </AuthenticatedLayout>
    );
}
