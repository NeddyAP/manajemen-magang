import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, BookOpen, Clipboard, FileText, MoreHorizontal } from 'lucide-react';

// Define the student progress data structure
export interface StudentProgress {
    id: number;
    name: string;
    email: string;
    profile: {
        student_number: string;
        study_program: string;
        academic_status: string;
    };
    internship_status: {
        waiting: number;
        accepted: number;
        rejected: number;
    };
    active_internship: {
        id: number;
        company_name: string;
        start_date: string;
        end_date: string;
        status: string;
    } | null;
    logbook_progress: {
        count: number;
        total_days: number;
        percentage: number;
    };
    report_status: {
        submitted: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    pending_items: {
        logbooks: number;
        reports: number;
    };
    completion_status: string | null;
}

export const columns: ColumnDef<StudentProgress>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Nama
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className="flex flex-col">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-muted-foreground text-sm">{student.profile?.student_number || 'N/A'}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'internship_status',
        header: 'Status Magang',
        cell: ({ row }) => {
            const student = row.original;
            const activeInternship = student.active_internship;

            if (!activeInternship) {
                if (student.internship_status.waiting > 0) {
                    return <Badge variant="outline">Menunggu Persetujuan</Badge>;
                }
                if (student.internship_status.rejected > 0) {
                    return <Badge variant="destructive">Ditolak</Badge>;
                }
                return <Badge variant="outline">Belum Mendaftar</Badge>;
            }

            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="default">{activeInternship.company_name}</Badge>
                    <span className="text-muted-foreground text-xs">{student.completion_status || 'Sedang Berlangsung'}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'logbook_progress',
        header: 'Logbook',
        cell: ({ row }) => {
            const student = row.original;
            const progress = student.logbook_progress;

            if (!student.active_internship) {
                return <span className="text-muted-foreground">N/A</span>;
            }

            return (
                <div className="flex w-full max-w-[200px] flex-col gap-1">
                    <div className="flex justify-between text-xs">
                        <span>
                            {progress.count} / {progress.total_days} entri
                        </span>
                        <span>{progress.percentage}%</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    {student.pending_items.logbooks > 0 && (
                        <Badge variant="outline" className="mt-1 w-fit">
                            {student.pending_items.logbooks} perlu review
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'report_status',
        header: 'Laporan',
        cell: ({ row }) => {
            const student = row.original;
            const reportStatus = student.report_status;

            if (!student.active_internship) {
                return <span className="text-muted-foreground">N/A</span>;
            }

            return (
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                        <Badge variant="outline">{reportStatus.submitted} Laporan</Badge>
                        {reportStatus.pending > 0 && <Badge variant="destructive">{reportStatus.pending} Menunggu</Badge>}
                    </div>
                    <div className="flex gap-2">
                        {reportStatus.approved > 0 && <Badge variant="default">{reportStatus.approved} Disetujui</Badge>}
                        {reportStatus.rejected > 0 && <Badge variant="destructive">{reportStatus.rejected} Ditolak</Badge>}
                    </div>
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const student = row.original;
            const activeInternship = student.active_internship;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        {activeInternship && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={`/internships/logbooks/${activeInternship.id}`}>
                                        <Clipboard className="mr-2 h-4 w-4" />
                                        Lihat Logbook
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/internships/reports/${activeInternship.id}`}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Lihat Laporan
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/internships/guidance-classes`}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Kelas Bimbingan
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
