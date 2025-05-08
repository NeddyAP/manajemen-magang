import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout'; // Changed from FrontLayout
import { formatDate as formatFullDate } from '@/lib/utils'; // Renamed to avoid conflict with date-fns format
import { BreadcrumbItem } from '@/types';
import { GuidanceClass, TableMeta } from '@/types/guidance-class'; // TableMeta might be needed if meta is passed to DataTable
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
// Removed date-fns imports as formatFullDate from utils.ts is used for general dates
// Icons like Clock, MapPin, User, Users are used by frontend, can keep or remove if not used by admin cards

// Import the new column definitions
import { columnAttendance, initialColumnVisibility } from './components/column-attendance';
// Removed ManageAttendance and userRole/isAttended specific imports
// Removed useState for attendanceStatusFilter, and the filter component itself for now

// Admin-specific breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelas Bimbingan',
        href: '/admin/guidance-classes',
    },
    {
        title: 'Detail Kelas',
        // href will be dynamically set if needed, or keep static for template
        // For a show page, it would typically be /admin/guidance-classes/[id]
        // Inertia automatically handles dynamic parts from controller routing, so a static one is fine here for the template.
        href: '#', // Placeholder, actual link managed by Inertia
    },
];

interface Props {
    class: GuidanceClass;
    meta?: TableMeta; // meta is passed from admin controller
    // Removed userRole and isAttended from Props
}

export default function ShowGuidanceClass({ class: guidanceClass, meta }: Props) {
    const studentCount = guidanceClass.students?.length || 0;
    // attendedStudentCount can be calculated if needed for display, similar to frontend
    const attendedStudentCount = guidanceClass.students?.filter((s) => s.attendance?.attended_at !== null).length || 0;

    // formatDate from utils.ts is typically for dd MMM yyyy. If HH:mm is needed, ensure utils.ts/formatDate supports it or use date-fns locally.
    // The original admin used formatDate from @/lib/utils which usually doesn't include time.
    // For consistency with original admin, using formatFullDate (alias for formatDate from utils)

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kelas: ${guidanceClass.title}`} />
            {/* Simplified layout structure, removing front-end specific container and styling */}
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Re-introducing a similar two-column layout for info and QR like original admin */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        {' '}
                        {/* Make info card wider */}
                        <CardHeader>
                            <CardTitle>Informasi Kelas</CardTitle>
                            {/* <CardDescription>Detail kelas bimbingan</CardDescription> */}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium">Judul</h4>
                                <p>{guidanceClass.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Dosen Pembimbing</h4>
                                <div className="space-y-1">
                                    <p className="font-medium">{guidanceClass.lecturer.name}</p>
                                    <p className="text-muted-foreground text-sm">NIP: {guidanceClass.lecturer.employee_number}</p>
                                    <p className="text-muted-foreground text-sm">{guidanceClass.lecturer.academic_position}</p>
                                    <p className="text-muted-foreground text-sm">Bidang: {guidanceClass.lecturer.expertise}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium">Waktu Mulai</h4>
                                    <p>{formatFullDate(guidanceClass.start_date)}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Waktu Selesai</h4>
                                    <p>{guidanceClass.end_date ? formatFullDate(guidanceClass.end_date) : '-'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Ruangan</h4>
                                    <p>{guidanceClass.room || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Kuota Peserta</h4>
                                    <Badge variant="default">
                                        {studentCount} Mahasiswa / {attendedStudentCount} Hadir
                                    </Badge>
                                </div>
                            </div>
                            {guidanceClass.description && (
                                <div className="mt-2">
                                    <h4 className="font-medium">Deskripsi</h4>
                                    <p className="text-muted-foreground text-sm">{guidanceClass.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code Presensi</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            {guidanceClass.qr_code ? (
                                <div className="rounded-md bg-white p-4">
                                    <QRCodeSVG value={guidanceClass.qr_code} size={200} />
                                </div>
                            ) : (
                                <p className="text-muted-foreground">QR Code belum dibuat</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Student List Card - similar to frontend's but using columnAttendance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kehadiran</CardTitle>
                        {/* <CardDescription>Daftar mahasiswa yang terdaftar di kelas bimbingan ini.</CardDescription> */}
                        {/* The AttendanceStatusFilter is removed for now. If needed, it can be re-added. */}
                        {/* The backend query for filtering by attendance status will not be triggered without UI controls. */}
                    </CardHeader>
                    <CardContent>
                        {guidanceClass.students && guidanceClass.students.length > 0 ? (
                            <DataTable
                                columns={columnAttendance} // Use the new column definitions
                                data={guidanceClass.students || []} // Ensure data is an array
                                meta={meta} // Pass meta for pagination
                                initialColumnVisibility={initialColumnVisibility} // Use visibility from new column defs
                                // Removed filter prop for now
                            />
                        ) : (
                            <div className="text-muted-foreground py-4 text-center">Belum ada mahasiswa yang terdaftar atau memenuhi kriteria.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
