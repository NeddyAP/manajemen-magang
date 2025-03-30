import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Check, QrCode, RefreshCcw, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface Student {
    id: number;
    name: string;
    student_number: string;
    study_program: string;
    semester: number;
    internship: {
        company_name: string;
        status: 'pending' | 'active' | 'ongoing';
    };
    attendance: {
        attended_at: string | null;
        attendance_method: string | null;
        notes: string | null;
    };
}

interface Props {
    classId: number;
    students: Student[];
    qrCode: string | null;
    isClassActive: boolean;
}

export default function ManageAttendance({ classId, students, qrCode, isClassActive }: Props) {
    const [generatingQR, setGeneratingQR] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);

    const handleGenerateQR = async () => {
        setGeneratingQR(true);

        router.post(
            route('front.internships.guidance-classes.generate-qr', classId),
            {},
            {
                onSuccess: () => {
                    setGeneratingQR(false);
                },
                onError: () => {
                    setGeneratingQR(false);
                },
            },
        );
    };

    const handleMarkAttendance = (studentId: number) => {
        setMarkingAttendance(true);

        router.post(
            route('front.internships.guidance-classes.mark-attendance', [classId, studentId]),
            {
                notes: 'Ditandai manual oleh dosen',
            },
            {
                onSuccess: () => {
                    setMarkingAttendance(false);
                },
                onError: () => {
                    setMarkingAttendance(false);
                },
            },
        );
    };

    const handleResetAttendance = (studentId: number) => {
        if (!confirm('Anda yakin ingin menghapus catatan kehadiran ini?')) return;

        setMarkingAttendance(true);

        router.delete(route('front.internships.guidance-classes.reset-attendance', [classId, studentId]), {
            onSuccess: () => {
                setMarkingAttendance(false);
            },
            onError: () => {
                setMarkingAttendance(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            {isClassActive && (
                <Card>
                    <CardHeader>
                        <CardTitle>QR Code Kehadiran</CardTitle>
                        <CardDescription>Bagikan QR Code ini dengan mahasiswa untuk absensi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-4 md:flex-row">
                            {qrCode ? (
                                <div className="flex flex-col items-center">
                                    <div className="mb-2 rounded-lg bg-white p-4">
                                        <QRCodeSVG value={qrCode} size={200} />
                                    </div>
                                    <Button variant="outline" onClick={handleGenerateQR} disabled={generatingQR} className="mt-2">
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Regenerasi QR Code
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                        <QrCode className="mx-auto h-16 w-16 text-gray-400" />
                                        <p className="text-muted-foreground mt-2">Belum ada QR Code</p>
                                    </div>
                                    <Button onClick={handleGenerateQR} disabled={generatingQR}>
                                        <QrCode className="mr-2 h-4 w-4" />
                                        Buat QR Code Kehadiran
                                    </Button>
                                </div>
                            )}

                            <div className="flex-1 md:ml-4">
                                <h3 className="mb-2 text-lg font-medium">Petunjuk</h3>
                                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                                    <li>Bagikan QR Code ini kepada mahasiswa untuk merekam kehadiran</li>
                                    <li>Mahasiswa dapat memindai QR Code dengan kamera ponsel</li>
                                    <li>QR Code dapat diregenerasi jika diperlukan</li>
                                    <li>Kehadiran juga dapat direkam secara manual</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        <QrCode className="mr-2 h-4 w-4" />
                        Tampilkan QR Code
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code Kehadiran</DialogTitle>
                        <DialogDescription>Bagikan QR Code ini dengan mahasiswa untuk absensi</DialogDescription>
                    </DialogHeader>
                    {qrCode ? (
                        <div className="flex justify-center p-6">
                            <div className="rounded-lg bg-white p-4">
                                <QRCodeSVG value={qrCode} size={280} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6">
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                <QrCode className="mx-auto h-16 w-16 text-gray-400" />
                                <p className="text-muted-foreground mt-2">Belum ada QR Code</p>
                            </div>
                            <Button onClick={handleGenerateQR} disabled={generatingQR} className="mt-4">
                                <QrCode className="mr-2 h-4 w-4" />
                                Buat QR Code Kehadiran
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Card>
                <CardHeader>
                    <CardTitle>Kehadiran Mahasiswa</CardTitle>
                    <CardDescription>Kelola kehadiran mahasiswa dalam kelas ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIM</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Program Studi</TableHead>
                                    <TableHead>Status Kehadiran</TableHead>
                                    <TableHead>Waktu Kehadiran</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Belum ada mahasiswa yang terdaftar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.student_number}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.study_program}</TableCell>
                                            <TableCell>
                                                {student.attendance.attended_at ? (
                                                    <div className="flex items-center">
                                                        <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                                                        <span className="text-green-600">Hadir</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-500"></div>
                                                        <span className="text-red-600">Belum Hadir</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {student.attendance.attended_at ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div>
                                                                    {format(new Date(student.attendance.attended_at), 'dd MMM yyyy, HH:mm', {
                                                                        locale: id,
                                                                    })}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Via: {student.attendance.attendance_method === 'qr_code' ? 'QR Code' : 'Manual'}
                                                                </p>
                                                                {student.attendance.notes && <p>Catatan: {student.attendance.notes}</p>}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isClassActive &&
                                                    (student.attendance.attended_at ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleResetAttendance(student.id)}
                                                            disabled={markingAttendance}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                            <span className="sr-only">Reset Kehadiran</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAttendance(student.id)}
                                                            disabled={markingAttendance}
                                                        >
                                                            <Check className="h-4 w-4 text-green-500" />
                                                            <span className="sr-only">Tandai Hadir</span>
                                                        </Button>
                                                    ))}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
