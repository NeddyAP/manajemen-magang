import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { GuidanceClass } from '@/types/guidance-class';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { columnAttendance, initialColumnVisibility } from './components/column-attendance';
import { AttendanceStatusFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelas Bimbingan',
        href: '/admin/guidance-classes',
    },
    {
        title: 'Detail Kelas',
        href: '/admin/guidance-classes/{id}',
    },
];

interface Props {
    class: GuidanceClass;
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export default function ShowGuidanceClass({ class: guidanceClass, meta }: Props) {
    const studentCount = guidanceClass.students?.length || 0;
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kelas: ${guidanceClass.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Kelas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
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
                            <div>
                                <h4 className="font-medium">Waktu Mulai</h4>
                                <p>{formatDate(guidanceClass.start_date)}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Waktu Selesai</h4>
                                <p>{guidanceClass.end_date ? formatDate(guidanceClass.end_date) : '-'}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Ruangan</h4>
                                <p>{guidanceClass.room || '-'}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Deskripsi</h4>
                                <p>{guidanceClass.description || '-'}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Kuota Peserta</h4>
                                <Badge variant="default">
                                    {studentCount}/{'∞'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code Presensi</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            {guidanceClass.qr_code ? (
                                // Wrap QR code in a div with white background and padding
                                <div className="rounded-md bg-white p-4">
                                    <QRCodeSVG value={guidanceClass.qr_code} size={200} />
                                </div>
                            ) : (
                                <p className="text-muted-foreground">QR Code belum dibuat</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kehadiran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columnAttendance}
                            data={guidanceClass.students || []}
                            meta={meta}
                            initialColumnVisibility={initialColumnVisibility}
                            filter={<AttendanceStatusFilter value={attendanceStatusFilter} onChange={setAttendanceStatusFilter} />}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
