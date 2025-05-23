import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, BookOpen, Clipboard, FileText, Users } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { StudentProgress, columns } from './columns';
import { StatusSelect } from './components/filters';

interface StudentsProgressProps {
    students: StudentProgress[];
    summary: {
        total_students: number;
        active_internships: number;
        pending_logbooks: number;
        pending_reports: number;
        upcoming_classes: number;
    };
    filters: {
        search?: string;
        filter?: string;
        sort_field?: string;
        sort_direction?: string;
    };
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Progress Mahasiswa',
        href: route('dosen.students-progress'),
    },
];

interface SummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    alert?: boolean;
}

const SummaryCard = memo(({ title, value, icon, alert = false }: SummaryCardProps) => {
    return (
        <Card className={alert ? 'border-yellow-500' : ''}>
            <CardContent className="flex flex-row items-center justify-between pt-6">
                <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-sm">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`rounded-full p-2 ${alert ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                    {alert ? <AlertCircle className="h-5 w-5" /> : icon}
                </div>
            </CardContent>
        </Card>
    );
});

SummaryCard.displayName = 'SummaryCard';

export default function StudentsProgress({ students, summary, filters, meta }: StudentsProgressProps) {
    const memoizedColumns = useMemo(() => columns, []);

    const handleFilterChange = useCallback((value: string) => {
        // Always reset to page 1 when applying a filter to prevent empty results
        router.get(route('dosen.students-progress'), value === '' || value === 'all' ? { page: 1 } : { filter: value, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
            only: ['students', 'meta', 'filters'],
        });
    }, []);

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Progress Mahasiswa" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Progress Mahasiswa</h1>
                        <p className="text-muted-foreground">Pantau kemajuan mahasiswa bimbingan Anda dalam program magang.</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <SummaryCard title="Total Mahasiswa" value={summary.total_students} icon={<Users className="h-5 w-5" />} />
                        <SummaryCard title="Magang Aktif" value={summary.active_internships} icon={<Clipboard className="h-5 w-5" />} />
                        <SummaryCard
                            title="Logbook Menunggu"
                            value={summary.pending_logbooks}
                            icon={<Clipboard className="h-5 w-5" />}
                            alert={summary.pending_logbooks > 0}
                        />
                        <SummaryCard
                            title="Laporan Menunggu"
                            value={summary.pending_reports}
                            icon={<FileText className="h-5 w-5" />}
                            alert={summary.pending_reports > 0}
                        />
                        <SummaryCard title="Kelas Mendatang" value={summary.upcoming_classes} icon={<BookOpen className="h-5 w-5" />} />
                    </div>

                    {/* Data Table with Filter */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                        <div className="mb-4 flex flex-col gap-2">
                            <h1 className="text-xl font-bold">Daftar Mahasiswa Bimbingan</h1>
                            <p> Lihat dan kelola progress mahasiswa bimbingan Anda.</p>
                        </div>
                        <div className="transition-all duration-300 ease-in-out hover:shadow-md">
                            <DataTable
                                className="inset-0 size-full"
                                columns={memoizedColumns}
                                data={students}
                                meta={meta}
                                filter={<StatusSelect value={filters.filter || 'all'} onChange={handleFilterChange} />}
                                filters={[
                                    {
                                        id: 'filter',
                                        value: filters.filter || '',
                                    },
                                ]}
                                searchPlaceholder="Cari nama, NIM, program studi..."
                                baseUrl={route('dosen.students-progress')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
