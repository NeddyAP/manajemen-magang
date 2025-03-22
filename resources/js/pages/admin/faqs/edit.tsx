import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Faq } from '.';
import FaqForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Faqs',
        href: '/admin/faqs',
    },
    {
        title: 'Edit Faq',
        href: '/admin/faqs/{id}/edit',
    },
];

interface Props {
    faq: Faq;
}

export default function EditFaq({ faq }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Faq: ${faq.question}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Faq</h1>
                    </div>

                    <FaqForm faq={faq} mode="edit" />
                </div>
            </div>
        </AppLayout>
    );
}
