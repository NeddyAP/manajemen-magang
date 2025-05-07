import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import GlobalVariableForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Global Variables',
        href: '/admin/global-variables',
    },
    {
        title: 'Tambah Global Variable',
        href: '/admin/global-variables/create',
    },
];

export default function CreateGlobalVariable() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Global Variable" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Create Global Variable</h1>
                    </div>

                    <GlobalVariableForm mode="create" />
                </div>
            </div>
        </AppLayout>
    );
}
