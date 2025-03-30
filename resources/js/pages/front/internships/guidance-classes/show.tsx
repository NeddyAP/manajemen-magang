import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { GuidanceClass, TableMeta } from '@/types/guidance-class';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, MapPin, User, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

interface ClassInfoCardProps {
    guidanceClass: GuidanceClass;
    formatDate: (date: string) => string;
    studentCount: number;
    maxParticipants: number;
    attendedStudentCount: number;
}

const ClassInfoCard: React.FC<ClassInfoCardProps> = ({
    guidanceClass,
    formatDate,
    studentCount,
    maxParticipants,
    attendedStudentCount,
}) => (
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
                        <p>
                            {studentCount} Mahasiswa {maxParticipants > 0 ? `(Maks. ${maxParticipants})` : ''}
                        </p>
                        <p className="text-muted-foreground text-sm">{attendedStudentCount} Hadir</p>
                    </div>
                </div>
            </div>
            {guidanceClass.description && (
                <div className="mt-4 border-t pt-4">
                    <h3 className="mb-2 font-medium">Deskripsi</h3>
                    <p className="text-muted-foreground text-sm">{guidanceClass.description}</p>
                </div>
            )}
        </CardContent>
    </Card>
);


export default function ShowGuidanceClass({ class: guidanceClass, meta, userRole, isAttended }: Props) {
    const studentCount = guidanceClass.students?.length || 0;
    const maxParticipants = guidanceClass.max_participants || 0;
    const attendedStudentCount = guidanceClass.students?.filter((s) => s.attendance.attended_at !== null).length || 0;

    const isClassActive =
        new Date(guidanceClass.start_date) <= new Date() && (!guidanceClass.end_date || new Date(guidanceClass.end_date) >= new Date());

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: id });
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kelas: ${guidanceClass.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
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
                                <ClassInfoCard
                                    guidanceClass={guidanceClass}
                                    formatDate={formatDate}
                                    studentCount={studentCount}
                                    maxParticipants={maxParticipants}
                                    attendedStudentCount={attendedStudentCount}
                                />
                                <ManageAttendance
                                    classId={guidanceClass.id}
                                    students={guidanceClass.students || []}
                                    qrCode={guidanceClass.qr_code}
                                    isClassActive={isClassActive}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="flex flex-col gap-6"> {/* Use flex-col and gap-6 for consistent spacing */}
                                    <ClassInfoCard
                                        guidanceClass={guidanceClass}
                                        formatDate={formatDate}
                                        studentCount={studentCount}
                                        maxParticipants={maxParticipants}
                                        attendedStudentCount={attendedStudentCount}
                                    />
                                </div>

                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Status Kehadiran Anda</CardTitle>
                                            <CardDescription>Informasi status kehadiran Anda di kelas ini</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {isAttended ? (
                                                <div className="flex flex-col items-center justify-center p-4">
                                                    <div className="mb-4 rounded-full bg-green-100 p-3 text-green-700">
                                                        <Users className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-green-700">Hadir</h3>
                                                    <p className="text-muted-foreground mt-2 text-center">
                                                        Anda sudah tercatat hadir di kelas bimbingan ini.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    {isClassActive && guidanceClass.qr_code ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="mb-4 rounded-lg bg-white p-4">
                                                                <QRCodeSVG value={guidanceClass.qr_code} size={200} />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-yellow-700 mb-2">Belum Hadir</h3>
                                                            <p className="text-muted-foreground text-center text-sm">
                                                                Scan QR code di atas dengan kamera ponsel Anda untuk merekam kehadiran
                                                            </p>
                                                        </div>
                                                    ) : isClassActive ? (
                                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                                            <div className="mb-4 rounded-full bg-yellow-100 p-3 text-yellow-700">
                                                                <Clock className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-yellow-700">QR Code tidak tersedia</h3>
                                                            <p className="text-muted-foreground mt-2">
                                                                QR Code kehadiran belum dibuat oleh dosen.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                                            <div className="mb-4 rounded-full bg-yellow-100 p-3 text-yellow-700">
                                                                <Clock className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-yellow-700">Belum Hadir</h3>
                                                            <p className="text-muted-foreground mt-2">
                                                                Anda belum tercatat hadir di kelas bimbingan ini.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
