import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { columns } from './components/column';

export interface Logbook {
    id: number;
    internship_id: number;
    date: string;
    activities: string;
    supervisor_notes: string | null;
}

interface Internship {
    id: number;
    company_name: string;
    type: string;
    start_date: string;
    end_date: string;
}

interface PageProps {
    internship: Internship;
    logbooks: Logbook[];
}

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

export default function LogbooksIndex({ internship, logbooks }: PageProps) {
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
                                    Periode: {format(new Date(internship.start_date), 'dd MMMM yyyy', { locale: id })} -{' '}
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

                        <DataTable columns={columns} data={logbooks} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
