import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import TutorialForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutorial',
        href: '/admin/tutorials',
    },
    {
        title: 'Tambah Tutorial',
        href: '/admin/tutorials/create',
    },
];

export default function CreateTutorial() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Tutorial" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Buat Tutorial</h1>
                    </div>

                    <TutorialForm mode="create" />
                </div>
            </div>
        </AppLayout>
    );
}
