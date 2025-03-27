import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Internship {
    id: number;
    user_id: number;
    type: string;
    company_name: string;
    company_address: string;
    start_date: string;
    end_date: string;
    status: string;
    progress: number;
    logbooks_count: number;
}

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
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Pilih Magang</h1>
                        </div>
                    </div>

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
                                                Periode: {format(new Date(internship.start_date), 'dd MMMM yyyy', { locale: id })} -{' '}
                                                {format(new Date(internship.end_date), 'dd MMMM yyyy', { locale: id })}
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
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
