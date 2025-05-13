import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import FrontLayout from '@/layouts/front-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { GuidanceClass, GuidanceClassStats, TableMeta } from '@/types/guidance-class'; // Import GuidanceClassStats
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarCheck, CalendarClock, CalendarOff, CalendarPlus, Plus } from 'lucide-react'; // Import more icons
import { useEffect, useRef, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Kelas Bimbingan',
        href: route('front.internships.guidance-classes.index'),
    },
];

interface PageProps {
    classes: GuidanceClass[];
    guidanceClassStats: GuidanceClassStats; // Add guidanceClassStats prop
    meta: TableMeta;
}

export default function GuidanceClassIndex({ classes, guidanceClassStats, meta }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize filters from URL on mount
    useEffect(() => {
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');

        if (status) {
            setSelectedStatus(status);
        }
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        updateFilters(status);
    };

    const updateFilters = (status: string) => {
        // Cancel any pending requests
        if (pendingRequestRef.current) {
            clearTimeout(pendingRequestRef.current);
            pendingRequestRef.current = null;
        }

        // Build query object with only non-empty values
        const query: Record<string, string> = {};

        // Preserve existing search term if present
        const url = new URL(window.location.href);
        const search = url.searchParams.get('search');
        if (search) {
            query.search = search;
        }

        // Add status filter if set
        if (status) {
            query.status = status;
        }

        // Navigate with updated filters after a small delay
        pendingRequestRef.current = setTimeout(() => {
            router.get(route('front.internships.guidance-classes.index'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['classes', 'meta', 'errors'],
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

    const isDosen = auth.role === 'dosen';
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelas Bimbingan" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Kelas Bimbingan</h1>
                                <p className="text-muted-foreground">Daftar kelas bimbingan yang tersedia</p>
                            </div>
                        </div>

                        {/* Analytics Cards */}
                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                                    <CalendarPlus className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{guidanceClassStats.total ?? 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Akan Datang</CardTitle>
                                    <CalendarClock className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{guidanceClassStats.upcoming ?? 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sedang Berlangsung</CardTitle>
                                    <CalendarCheck className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{guidanceClassStats.ongoing ?? 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                                    <CalendarOff className="text-muted-foreground h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{guidanceClassStats.finished ?? 0}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters and Create Button */}
                        <div className="mb-4 flex items-center justify-between">
                            <StatusFilter value={selectedStatus} onChange={handleStatusChange} />
                            {isDosen && (
                                <Button asChild>
                                    <Link href={route('front.internships.guidance-classes.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Buat Kelas Bimbingan
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <DataTable
                            meta={meta}
                            columns={columns}
                            data={classes}
                            filters={[{ id: 'status', value: selectedStatus }]}
                            initialColumnVisibility={initialColumnVisibility}
                            searchPlaceholder="Cari kelas berdasarkan judul, dosen, ruangan..."
                        />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
