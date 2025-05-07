import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { GlobalVariable } from '@/types/global-variable';
import { Head } from '@inertiajs/react';
import GlobalVariableForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Global Variables',
        href: '/admin/global-variables',
    },
    {
        title: 'Edit Global Variable',
        href: '/admin/global-variables/{id}/edit',
    },
];

interface Props {
    globalVariable: GlobalVariable;
}

export default function EditGlobalVariable({ globalVariable }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Global Variable: ${globalVariable.key}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Global Variable</h1>
                    </div>

                    <GlobalVariableForm globalVariable={globalVariable} mode="edit" />
                </div>
            </div>
        </AppLayout>
    );
}
