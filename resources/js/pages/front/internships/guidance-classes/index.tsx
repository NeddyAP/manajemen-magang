import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import FrontLayout from '@/layouts/front-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { GuidanceClass, TableMeta } from '@/types/guidance-class';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Plus, QrCode, Users } from 'lucide-react';
import { columns, initialColumnVisibility } from './components/column';

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
    meta: TableMeta;
}

export default function GuidanceClassIndex({ classes, meta }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const isDosen = auth.user?.roles?.[0]?.name === 'dosen';
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelas Bimbingan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Kelas Bimbingan</h1>
                                <p className="text-muted-foreground">Daftar kelas bimbingan yang tersedia</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="bg-card text-card-foreground rounded-lg p-6 shadow">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Kelas Aktif</h3>
                                    <Calendar className="text-primary h-5 w-5" />
                                </div>
                                <p className="mt-2 text-2xl font-bold">
                                    {
                                        classes.filter(
                                            (c) => new Date(c.start_date) <= new Date() && (!c.end_date || new Date(c.end_date) >= new Date()),
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="bg-card text-card-foreground rounded-lg p-6 shadow">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Total Kelas</h3>
                                    <Users className="text-primary h-5 w-5" />
                                </div>
                                <p className="mt-2 text-2xl font-bold">{classes.length}</p>
                            </div>
                            <div className="bg-card text-card-foreground rounded-lg p-6 shadow">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Kehadiran</h3>
                                    <QrCode className="text-primary h-5 w-5" />
                                </div>
                                <p className="mt-2 text-2xl font-bold">
                                    {classes.filter((c) => c.students?.some((s) => s.attendance.attended_at !== null)).length}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            {isDosen && (
                                <Button asChild>
                                    <Link href={route('front.internships.guidance-classes.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Buat Kelas Bimbingan
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <DataTable meta={meta} columns={columns} data={classes} initialColumnVisibility={initialColumnVisibility} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
