import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FaqForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Faqs',
        href: '/admin/faqs',
    },
    {
        title: 'Tambah FAQ',
        href: '/admin/faqs/create',
    },
];

export default function CreateFaq() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create FAQ" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Create FAQ</h1>
                    </div>

                    <FaqForm mode="create" />
                </div>
            </div>
        </AppLayout>
    );
}
