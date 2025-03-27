import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { User } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter, TypeFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permohonan Magang',
        href: '/internships/applicants',
    },
];

export interface Internship {
    id?: number;
    user_id?: number;
    user?: User;
    type?: string;
    application_file?: string;
    company_name?: string;
    company_address?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    progress?: number;
    progress_percentage?: number;
    created_at?: string;
    updated_at?: string;
    status_message?: string | null;
}

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface InternshipsProps {
    internships: Internship[];
    meta: TableMeta;
}

export default function Applicants({ internships, meta }: InternshipsProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    // Initialize filters from URL on mount
    useEffect(() => {
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        const type = url.searchParams.get('type');

        if (status) {
            setSelectedStatus(status);
        }
        if (type) {
            setSelectedType(type);
        }
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);

        // Build query object
        const query: Record<string, string> = {};
        if (status) query.status = status;
        if (selectedType) query.type = selectedType;

        router.get(route('front.internships.applicants.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);

        // Build query object
        const query: Record<string, string> = {};
        if (selectedStatus) query.status = selectedStatus;
        if (type) query.type = type;

        router.get(route('front.internships.applicants.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Permohonan Magang" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex gap-2">
                            <StatusFilter value={selectedStatus} onChange={handleStatusChange} />
                            <TypeFilter value={selectedType} onChange={handleTypeChange} />
                        </div>
                        <Button>
                            <Link href={route('front.internships.applicants.create')} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Ajukan Magang
                            </Link>
                        </Button>
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={internships}
                        filters={[
                            { id: 'status', value: selectedStatus },
                            { id: 'type', value: selectedType },
                        ]}
                        meta={meta}
                        deleteRoute={route('front.internships.applicants.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                    />
                </div>
            </div>
        </FrontLayout>
    );
}
