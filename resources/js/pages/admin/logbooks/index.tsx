import { DataTable } from '@/components/data-table/data-table';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';
import { columns, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Logbook',
        href: '/admin/logbooks',
    },
];
export interface Logbook {
    id: number;
    internship_id: number;
    date: string;
    activities: string;
    supervisor_notes: string;
    created_at: string;
    updated_at: string;
    internship: {
        id: number;
        company_name: string;
        company_address: string;
        start_date: string;
        end_date: string;
        user: User & {
            mahasiswaProfile: {
                id: number;
                nim: string;
                prodi: {
                    id: number;
                    name: string;
                };
                fakultas: {
                    id: number;
                    name: string;
                };
                advisor: {
                    id: number;
                    name: string;
                    dosenProfile: {
                        id: number;
                        nip: string;
                    };
                };
            };
        };
    };
}

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface LogbookProps {
    logbooks: Logbook[];
    meta: TableMeta;
}

export default function Logbooks({ logbooks, meta }: LogbookProps) {
    console.log(logbooks);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={logbooks}
                        meta={meta}
                        deleteRoute={route('admin.logbooks.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
