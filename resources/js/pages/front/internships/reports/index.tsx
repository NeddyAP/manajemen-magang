import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import FrontLayout from '@/layouts/front-layout'; // Ensure FrontLayout is imported
import { TableMeta, type BreadcrumbItem } from '@/types';
import { type Internship, type Report, type ReportStats } from '@/types/internship'; // Import ReportStats
import { Head, Link, router } from '@inertiajs/react'; // Correct inertia import
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Laporan',
        href: route('front.internships.reports.intern-list'),
    },
    {
        title: 'Detail Laporan',
        href: '#', // Keep as # or update if a specific route exists
    },
];

interface PageProps {
    internship: Internship;
    reports: Report[];
    reportStats: ReportStats; // Add reportStats prop
    meta: TableMeta;
}

export default function ReportsIndex({ internship, reports, reportStats, meta }: PageProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        const search = url.searchParams.get('search');

        if (status) {
            setSelectedStatus(status);
        }

        if (search) {
            setSearchTerm(search);
        }
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        updateFilters(status, searchTerm);
    };

    const handleSearchChange = (search: string) => {
        setSearchTerm(search);
        updateFilters(selectedStatus, search);
    };

    const updateFilters = (status: string, search: string) => {
        // Cancel any pending requests
        if (pendingRequestRef.current) {
            clearTimeout(pendingRequestRef.current);
            pendingRequestRef.current = null;
        }

        // Build query object with only non-empty values
        const query: Record<string, string> = {};

        // Add search term if present
        if (search) {
            query.search = search;
        }

        // Add status filter if set
        if (status) {
            query.status = status;
        }

        // Navigate with updated filters after a small delay
        pendingRequestRef.current = setTimeout(() => {
            router.get(route('front.internships.reports.index', internship.id), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['reports', 'meta', 'errors'],
            });
            pendingRequestRef.current = null;
        }, 100);
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (pendingRequestRef.current) {
                clearTimeout(pendingRequestRef.current);
                pendingRequestRef.current = null;
            }
        };
    }, []);

    if (!internship.start_date || !internship.end_date) return 'Tanggal magang tidak valid';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Laporan Magang</h1>
                                <p className="text-muted-foreground">
                                    {internship.company_name} - {internship.type}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Periode: {format(parseISO(internship.start_date), 'dd MMMM yyyy', { locale: id })} -{' '}
                                    {format(parseISO(internship.end_date), 'dd MMMM yyyy', { locale: id })}
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
                                <Button asChild>
                                    <Link href={route('front.internships.reports.create', internship.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Laporan
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Analytics Cards */}
                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reportStats.total ?? 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reportStats.pending ?? 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reportStats.approved ?? 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reportStats.rejected ?? 0}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Data Table */}
                        <DataTable
                            meta={meta}
                            columns={columns}
                            data={reports}
                            filter={<StatusFilter value={selectedStatus} onChange={handleStatusChange} />}
                            filters={[{ id: 'status', value: selectedStatus }]}
                            initialColumnVisibility={initialColumnVisibility}
                            searchPlaceholder="Cari laporan berdasarkan judul, versi, status..."
                            initialSearchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
