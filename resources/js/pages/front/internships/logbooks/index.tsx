import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import FrontLayout from '@/layouts/front-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Internship, Logbook } from '@/types/internship';
import { Head, Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
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
    totalLogbookCount: number; // Add totalLogbookCount prop
    meta: TableMeta;
}

export default function LogbooksIndex({ internship, logbooks, totalLogbookCount, meta }: PageProps) {
    if (!internship.start_date || !internship.end_date || typeof internship.start_date !== 'string' || typeof internship.end_date !== 'string')
        return '-';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-6 text-xl font-bold">Logbook Magang</h1>
                                <p>Mahasiswa: {internship.user?.name}</p>
                                <p className="text-muted-foreground">
                                    Nama Perusahaan: {internship.company_name} - {internship.type}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Periode: {format(parseISO(internship.start_date), 'PP', { locale: id })}; -{' '}
                                    {format(new Date(internship.end_date), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="transition-colors duration-200 ease-in-out"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Button>
                                <Button asChild className="transition-colors duration-200 ease-in-out">
                                    <Link href={route('front.internships.logbooks.create', internship.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Logbook
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Analytics Card */}
                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Entri Logbook</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalLogbookCount ?? 0}</div>
                                </CardContent>
                            </Card>
                            {/* Add more cards here if needed */}
                        </div>

                        <div className="transition-all duration-300 ease-in-out hover:shadow-md">
                            <DataTable meta={meta} columns={columns} data={logbooks} initialColumnVisibility={initialColumnVisibility} />
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
