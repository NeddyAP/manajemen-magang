import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, UserIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
];

interface User {
    role: string;
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

export default function InternshipsIndex() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isMahasiswa = user?.role === 'mahasiswa';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Magang" />
            <div className="flex h-full min-h-min flex-1 flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative container mx-auto max-w-7xl flex-1 overflow-hidden rounded-xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Program Magang</h1>
                        <p className="text-muted-foreground">Kelola aplikasi dan progres magang Anda</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {isMahasiswa && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Aplikasi Magang</CardTitle>
                                        <UserIcon className="text-primary h-6 w-6" />
                                    </div>
                                    <CardDescription>Ajukan program magang</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm">Kirim aplikasi magang Anda dengan dokumen dan informasi yang diperlukan</p>
                                    <Button asChild>
                                        <Link href={route('front.internships.applicants.create')}>Ajukan Sekarang</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Aplikasi Saya</CardTitle>
                                    <UserIcon className="text-primary h-6 w-6" />
                                </div>
                                <CardDescription>Lihat aplikasi magang Anda</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm">Periksa status aplikasi Anda dan kelola progres magang Anda</p>
                                <Button asChild variant="outline">
                                    <Link href={route('front.internships.applicants.index')}>Lihat Aplikasi</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Logbook Magang</CardTitle>
                                    <BookOpen className="text-primary h-6 w-6" />
                                </div>
                                <CardDescription>Kelola logbook magang Anda</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm">Catat dan dokumentasikan aktivitas magang Anda setiap hari</p>
                                <Button asChild variant="outline">
                                    <Link href={route('front.internships.logbooks.intern-list')}>Pilih Magang</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
