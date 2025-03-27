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
    company_name: string;
    type: string;
    start_date: string;
    end_date: string;
}

interface PageProps {
    internship: Internship;
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
        title: 'Tambah Logbook',
        href: '#',
    },
];

export default function LogbookCreate({ internship }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split('T')[0], // Set today's date as default
        activities: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('front.internships.logbooks.store', internship.id));
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Logbook" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Tambah Logbook</h1>
                        <p className="text-muted-foreground">
                            {internship.company_name} - {internship.type}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Periode:{' '}
                            {new Date(internship.start_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}{' '}
                            -{' '}
                            {new Date(internship.end_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
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
                                min={internship.start_date}
                                max={internship.end_date}
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
                                placeholder="Jelaskan aktivitas yang Anda lakukan hari ini..."
                            />
                            {errors.activities && <p className="text-destructive text-sm">{errors.activities}</p>}
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                Simpan
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
