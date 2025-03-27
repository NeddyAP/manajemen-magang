import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Logbook } from '.';
import LogbookForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Logbook',
        href: '/admin/logbooks',
    },
    {
        title: 'Detail Logbook',
        href: '/admin/logbooks/{id}',
    },
];

interface Props {
    logbook: Logbook;
}

export default function ShowLogbook({ logbook }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Logbook: ${logbook.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        {/* backbutton */}
                        <a href={route('admin.logbooks.index')} className="text-blue-500 hover:underline">
                            {' '}
                            Kembali
                        </a>
                        <h1 className="text-2xl font-bold">Detail Logbook</h1>
                    </div>

                    <LogbookForm logbook={logbook} />
                </div>
            </div>
        </AppLayout>
    );
}
