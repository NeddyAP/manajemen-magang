import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { GuidanceClass, TableMeta } from '@/types/guidance-class';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, MapPin, Scan, User, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import ManageAttendance from './components/manage-attendance';
import { userColumns } from './components/user-column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Kelas Bimbingan',
        href: route('front.internships.guidance-classes.index'),
    },
    {
        title: 'Detail',
        href: '#',
    },
];

interface Props {
    class: GuidanceClass;
    meta: TableMeta;
    userRole: 'mahasiswa' | 'dosen';
    isAttended: boolean;
}

export default function ShowGuidanceClass({ class: guidanceClass, meta, userRole, isAttended }: Props) {
    const studentCount = guidanceClass.students?.length || 0;
    const attendedStudentCount = guidanceClass.students?.filter((s) => s.attendance.attended_at !== null).length || 0;

    const isClassActive =
        new Date(guidanceClass.start_date) <= new Date() && (!guidanceClass.end_date || new Date(guidanceClass.end_date) >= new Date());

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: id });
    };

    const [isAttending, setIsAttending] = useState(false);

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kelas: ${guidanceClass.title}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl p-4">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">{guidanceClass.title}</h1>
                            <div className="text-muted-foreground mt-1 flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                    {guidanceClass.lecturer.name} ({guidanceClass.lecturer.academic_position})
                                </span>
                            </div>
                        </div>

                        {userRole === 'dosen' ? (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informasi Kelas</CardTitle>
                                        <CardDescription>Detail kelas bimbingan</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="flex items-start">
                                                <Clock className="text-muted-foreground mt-0.5 mr-3 h-5 w-5" />
                                                <div>
                                                    <h3 className="font-medium">Waktu</h3>
                                                    <p>Mulai: {formatDate(guidanceClass.start_date)}</p>
                                                    {guidanceClass.end_date && <p>Selesai: {formatDate(guidanceClass.end_date)}</p>}
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <MapPin className="text-muted-foreground mt-0.5 mr-3 h-5 w-5" />
                                                <div>
                                                    <h3 className="font-medium">Lokasi</h3>
                                                    <p>{guidanceClass.room || 'Tidak ditentukan'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Users className="text-muted-foreground mt-0.5 mr-3 h-5 w-5" />
                                                <div>
                                                    <h3 className="font-medium">Partisipan</h3>
                                                    <p>{studentCount} Mahasiswa</p>
                                                    <p className="text-muted-foreground text-sm">{attendedStudentCount} Hadir</p>
                                                </div>
                                            </div>
                                        </div>
                                        {guidanceClass.description && (
                                            <div className="mt-4 border-t pt-4 md:col-span-3">
                                                <h3 className="mb-2 font-medium">Deskripsi</h3>
                                                <p className="text-muted-foreground text-sm">{guidanceClass.description}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <ManageAttendance
                                    classId={guidanceClass.id}
                                    students={guidanceClass.students || []}
                                    qrCode={guidanceClass.qr_code}
                                    isClassActive={isClassActive}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Card className="mb-4">
                                    <CardHeader>
                                        <CardTitle>Informasi Kelas</CardTitle>
                                        <CardDescription>Detail kelas bimbingan</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="flex items-start">
                                                <Clock className="text-muted-foreground mt-0.5 mr-2 h-5 w-5" />
                                                <div>
                                                    <h3 className="font-medium">Waktu</h3>
                                                    <p>Mulai: {formatDate(guidanceClass.start_date)}</p>
                                                    {guidanceClass.end_date && <p>Selesai: {formatDate(guidanceClass.end_date)}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <MapPin className="text-muted-foreground mt-0.5 mr-2 h-5 w-5" />
                                                <div>
                                                    <h3 className="font-medium">Lokasi</h3>
                                                    <p>{guidanceClass.room || 'Tidak ditentukan'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Users className="text-muted-foreground mt-0.5 mr-2 h-5 w-5" />
                                                <div>
                                                    <h3 className="font-medium">Partisipan</h3>
                                                    <p>{studentCount} Mahasiswa</p>
                                                    <p className="text-muted-foreground text-sm">{attendedStudentCount} Hadir</p>
                                                </div>
                                            </div>
                                            {guidanceClass.description && (
                                                <div className="mt-4 border-t pt-4 md:col-span-3">
                                                    <h3 className="mb-2 font-medium">Deskripsi</h3>
                                                    <p className="text-muted-foreground text-sm">{guidanceClass.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {userRole === 'mahasiswa' && isClassActive && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Kehadiran</CardTitle>
                                            <CardDescription>Rekam kehadiran Anda untuk kelas ini</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isAttended ? (
                                                <div className="flex flex-col items-center justify-center p-4">
                                                    <div className="mb-4 rounded-full bg-green-100 p-3 text-green-700">
                                                        <Users className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-green-700">Kehadiran Terekam</h3>
                                                    <p className="text-muted-foreground mt-2 text-center">
                                                        Anda sudah tercatat hadir di kelas bimbingan ini.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    {guidanceClass.qr_code ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="mb-4 rounded-lg bg-white p-4">
                                                                <QRCodeSVG value={guidanceClass.qr_code} size={200} />
                                                            </div>
                                                            <p className="text-muted-foreground mt-2 text-center text-sm">
                                                                Scan QR code di atas dengan kamera ponsel Anda untuk merekam kehadiran
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="mt-4 flex items-center gap-2 p-6 text-base"
                                                                disabled={isAttending || !guidanceClass.qr_code}
                                                                onClick={async () => {
                                                                    if (!guidanceClass.qr_code) return;
                                                                    setIsAttending(true);
                                                                    router.visit(guidanceClass.qr_code as string, {
                                                                        method: 'get',
                                                                        preserveScroll: true,
                                                                        onFinish: () => setIsAttending(false),
                                                                        onSuccess: () => router.reload({ only: ['class', 'isAttended'] }),
                                                                    });
                                                                }}
                                                            >
                                                                {isAttending ? (
                                                                    <>
                                                                        <svg
                                                                            className="mr-2 h-5 w-5 animate-spin text-white"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                className="opacity-25"
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="currentColor"
                                                                                strokeWidth="4"
                                                                            ></circle>
                                                                            <path
                                                                                className="opacity-75"
                                                                                fill="currentColor"
                                                                                d="M4 12a8 8 0 018-8v8z"
                                                                            ></path>
                                                                        </svg>
                                                                        Memproses...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Scan className="h-5 w-5" />
                                                                        Rekam Kehadiran
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                                            <div className="mb-4 rounded-full bg-yellow-100 p-3 text-yellow-700">
                                                                <Clock className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-yellow-700">QR Code tidak tersedia</h3>
                                                            <p className="text-muted-foreground mt-2">QR Code kehadiran belum dibuat oleh dosen.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mahasiswa</CardTitle>
                                        <CardDescription>Daftar mahasiswa yang terdaftar</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {guidanceClass.students && guidanceClass.students.length > 0 ? (
                                            <DataTable meta={meta} columns={userColumns} data={guidanceClass.students} initialColumnVisibility={{}} />
                                        ) : (
                                            <div className="text-muted-foreground py-4 text-center">Belum ada mahasiswa yang terdaftar.</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
