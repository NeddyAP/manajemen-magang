import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Faq } from '@/types/faq';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { columns, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Faqs',
        href: '/admin/faqs',
    },
];

interface FaqsProps {
    faqs: Faq[];
    meta: TableMeta;
}

export default function Faqs({ faqs, meta }: FaqsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Faqs" />
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
                    <div className="mb-4 flex items-center justify-end">
                        <Button>
                            <Link href={route('admin.faqs.create')} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Faq
                            </Link>
                        </Button>
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={faqs}
                        meta={meta}
                        deleteRoute={route('admin.faqs.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
