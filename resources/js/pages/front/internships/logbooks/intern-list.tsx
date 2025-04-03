import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Internship } from '@/types/internship';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';

interface PageProps {
    internships: Internship[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Logbook',
        href: '#',
    },
];

export default function InternshipList({ internships }: PageProps) {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Magang" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl p-6">
                        {' '}
                        {/* Added padding */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Pilih Magang</h1>
                                <p className="text-muted-foreground">Pilih salah satu magang untuk melihat atau mengisi logbook.</p>{' '}
                                {/* Added description */}
                            </div>
                        </div>
                        {internships.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {internships.map((internship) => (
                                    <Card key={internship.id}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{internship.company_name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-muted-foreground text-sm">Jenis Magang: {internship.type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-sm">
                                                        Periode:{' '}
                                                        {internship.start_date
                                                            ? format(new Date(internship.start_date), 'dd MMMM yyyy', { locale: id })
                                                            : 'Belum ditentukan'}{' '}
                                                        -{' '}
                                                        {internship.end_date
                                                            ? format(new Date(internship.end_date), 'dd MMMM yyyy', { locale: id })
                                                            : 'Belum ditentukan'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground mb-2 text-sm">Progress Logbook</p>
                                                    <Progress value={internship.progress} className="h-2" />
                                                    <p className="text-muted-foreground mt-1 text-xs">{internship.logbooks_count} dari 30 hari</p>
                                                </div>
                                                <Button className="w-full" asChild>
                                                    <a href={route('front.internships.logbooks.index', internship.id)}>Lihat Logbook</a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                                <h3 className="text-xl font-semibold tracking-tight">Anda belum memiliki magang aktif.</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Silakan ajukan pendaftaran magang terlebih dahulu.</p>
                                <Button className="mt-6" asChild>
                                    <Link href={route('front.internships.applicants.create')}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Ajukan Magang Baru
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
