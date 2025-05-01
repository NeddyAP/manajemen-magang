import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Check, QrCode, RefreshCcw, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useMemo, useState } from 'react';

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
    const [markingAttendance, setMarkingAttendance] = useState<number | null>(null);
    const [resettingAttendance, setResettingAttendance] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'all' | 'present' | 'absent'>('all');

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const searchMatch =
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.student_number.toLowerCase().includes(searchTerm.toLowerCase());

            const isPresent = student.attendance.attended_at !== null;
            let statusMatch = true;
            if (attendanceStatusFilter === 'present') {
                statusMatch = isPresent;
            } else if (attendanceStatusFilter === 'absent') {
                statusMatch = !isPresent;
            }

            return searchMatch && statusMatch;
        });
    }, [students, searchTerm, attendanceStatusFilter]);

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

    const handleMarkAttendance = useCallback(
        (studentId: number) => {
            setMarkingAttendance(studentId);
            router.post(
                `/internships/guidance-classes/${classId}/attendance/${studentId}`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['guidanceClass'] });
                    },
                    onFinish: () => setMarkingAttendance(null),
                    onError: (errors) => {
                        console.error('Error marking attendance:', errors);
                    },
                },
            );
        },
        [classId],
    );

    const handleResetAttendance = useCallback(
        (studentId: number) => {
            setResettingAttendance(studentId);
            router.delete(`/internships/guidance-classes/${classId}/attendance/${studentId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['guidanceClass'] });
                },
                onFinish: () => setResettingAttendance(null),
                onError: (errors) => {
                    console.error('Error resetting attendance:', errors);
                },
            });
        },
        [classId],
    );

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
                    <CardDescription>Kelola kehadiran mahasiswa dalam kelas ini. Total terdaftar: {students.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                        <Input
                            placeholder="Cari Nama / NIM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select
                            value={attendanceStatusFilter}
                            onValueChange={(value) => setAttendanceStatusFilter(value as 'all' | 'present' | 'absent')}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="present">Hadir</SelectItem>
                                <SelectItem value="absent">Belum Hadir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            {students.length === 0
                                                ? 'Belum ada mahasiswa yang terdaftar.'
                                                : 'Tidak ada mahasiswa yang cocok dengan filter.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.student_number}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.study_program}</TableCell>
                                            <TableCell>
                                                {student.attendance.attended_at ? (
                                                    <span className="text-green-600">Hadir</span>
                                                ) : (
                                                    <span className="text-gray-500">Belum Hadir</span>
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
                                                <TooltipProvider>
                                                    <div className="flex items-center space-x-2">
                                                        {student.attendance.attended_at ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        onClick={() => handleResetAttendance(student.id)}
                                                                        disabled={resettingAttendance === student.id}
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <X className="h-4 w-4 text-red-500" />
                                                                        <span className="sr-only">Reset Kehadiran</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Reset Kehadiran</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handleMarkAttendance(student.id)}
                                                                        disabled={markingAttendance === student.id}
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                        <span className="sr-only">Tandai Hadir</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Tandai Hadir (Manual)</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TooltipProvider>
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
