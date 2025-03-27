import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Internship {
    id: number;
    title: string;
}

interface PageProps {
    internship: Internship;
    logbook: Logbook;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Logbook',
        href: route('front.internships.logbooks.index', { internship: 0 }),
    },
    {
        title: 'Edit Logbook',
        href: '#',
    },
];

export default function LogbookEdit({ internship, logbook }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        date: logbook.date,
        activities: logbook.activities,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('front.internships.logbooks.update', [internship.id, logbook.id]));
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Logbook" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Logbook</h1>
                        <p className="text-muted-foreground">{internship.title}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className={errors.date ? 'border-destructive' : ''}
                            />
                            {errors.date && <p className="text-destructive text-sm">{errors.date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="activities">Aktivitas</Label>
                            <Textarea
                                id="activities"
                                value={data.activities}
                                onChange={(e) => setData('activities', e.target.value)}
                                className={errors.activities ? 'border-destructive' : ''}
                                rows={5}
                            />
                            {errors.activities && <p className="text-destructive text-sm">{errors.activities}</p>}
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                Simpan Perubahan
                            </Button>
                            <Button asChild variant="outline" type="button">
                                <Link href={route('front.internships.logbooks.index', internship.id)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </FrontLayout>
    );
}
