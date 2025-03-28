import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Internship, Logbook } from '@/types/internship';
import { Head, Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { columns, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Logbook',
        href: route('front.internships.logbooks.intern-list'),
    },
    {
        title: 'Detail',
        href: route('front.internships.logbooks.intern-list'),
    },
];

interface PageProps {
    internship: Internship;
    logbooks: Logbook[];
    meta: TableMeta;
}

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export default function LogbooksIndex({ internship, logbooks, meta }: PageProps) {
    if (!internship.start_date || !internship.end_date || typeof internship.start_date !== 'string' || typeof internship.end_date !== 'string')
        return '-';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Magang" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Logbook Magang</h1>
                                <p className="text-muted-foreground">
                                    {internship.company_name} - {internship.type}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Periode: {format(parseISO(internship.start_date), 'PP', { locale: id })}; -{' '}
                                    {format(new Date(internship.end_date), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={route('front.internships.logbooks.create', internship.id)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Logbook
                                </Link>
                            </Button>
                        </div>

                        <DataTable meta={meta} columns={columns} data={logbooks} initialColumnVisibility={initialColumnVisibility} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
