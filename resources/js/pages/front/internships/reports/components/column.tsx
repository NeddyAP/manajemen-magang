'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog components
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
import { Label } from '@/components/ui/label'; // Import Label
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components
import { type PageProps } from '@/types'; // Use original import path for PageProps
import { type Report } from '@/types/internship';
import { Link, router, usePage } from '@inertiajs/react'; // Import usePage
import { type ColumnDef, type Row, type VisibilityState } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, FileSpreadsheet, MoreHorizontal, XCircle } from 'lucide-react'; // Import CheckCircle and XCircle
import { useState } from 'react'; // Import useState

export const initialColumnVisibility: VisibilityState = {
    id: false,
    updated_at: false,
};

// Actions cell component to enable Hook usage within a component
function ReportActionsCell({ row }: { row: Row<Report> }) {
    const report = row.original;
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const isOwner = user.id === report.user_id;
    const isAdvisorOrAdmin = user.roles?.some((role: { name: string }) => ['dosen', 'admin'].includes(role.name)) ?? false;

    const canEdit = isOwner && report.status !== 'approved';
    const canDelete = isOwner;
    const canApproveReject = isAdvisorOrAdmin && report.status === 'pending';

    const [rejectionNote, setRejectionNote] = useState('');

    const handleDelete = () => {
        router.delete(route('front.internships.reports.destroy', { internship: report.internship_id, report: report.id }), {
            preserveScroll: true,
        });
    };

    const handleApprove = () => {
        router.post(route('front.internships.reports.approve', { internship: report.internship_id, report: report.id }), undefined, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        router.post(
            route('front.internships.reports.reject', { internship: report.internship_id, report: report.id }),
            { rejection_note: rejectionNote },
            { preserveScroll: true, onSuccess: () => setRejectionNote('') },
        );
    };

    return (
        <div className="flex items-center justify-end space-x-2">
            {canApproveReject && (
                <TooltipProvider delayDuration={100}>
                    {/* Approve Dialog */}
                    <AlertDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="sr-only">Setujui</span>
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Setujui Laporan</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Setujui Laporan?</AlertDialogTitle>
                                <AlertDialogDescription>Apakah Anda yakin ingin menyetujui laporan ini?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                    Ya, Setujui
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {/* Reject Dialog */}
                    <AlertDialog onOpenChange={(open) => !open && setRejectionNote('')}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                                        <XCircle className="h-4 w-4" />
                                        <span className="sr-only">Tolak</span>
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Tolak Laporan</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tolak Laporan?</AlertDialogTitle>
                                <AlertDialogDescription>Silakan berikan alasan penolakan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-2 py-4">
                                <Label htmlFor="rejection-note">Catatan Penolakan</Label>
                                <Textarea
                                    id="rejection-note"
                                    placeholder="Masukkan alasan penolakan..."
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90">
                                    Ya, Tolak
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TooltipProvider>
            )}
            {/* Owner Actions Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    {/* Download */}
                    <DropdownMenuItem asChild>
                        <a
                            href={route('front.internships.reports.download', { internship: report.internship_id, report: report.id })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Unduh
                        </a>
                    </DropdownMenuItem>
                    {canEdit && (
                        <DropdownMenuItem asChild>
                            <Link href={route('front.internships.reports.edit', { internship: report.internship_id, report: report.id })}>Edit</Link>
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                        Hapus
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                                        <AlertDialogDescription>Tindakan ini tidak dapat diurungkan.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                            Ya, Hapus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export const columns: ColumnDef<Report>[] = [
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
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Judul" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'version',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Versi" />,
        cell: ({ row }) => <div className="text-center">{row.getValue('version')}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.original.status;

            if (!status || typeof status !== 'string') return '-';

            const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
                pending: { label: 'Menunggu', variant: 'secondary' },
                approved: { label: 'Disetujui', variant: 'outline' },
                rejected: { label: 'Ditolak', variant: 'destructive' },
            };
            const statusInfo = statusMap[status] || { label: status, variant: 'default' };

            return (
                <div className="flex flex-col items-start gap-1">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'report_file',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berkas" />,
        cell: ({ row }) => {
            const filePath = row.getValue('report_file');
            if (!filePath || typeof filePath !== 'string') return '-';

            const fileUrl = `/storage/${filePath}`;

            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    <FileSpreadsheet className="mr-2 inline h-4 w-4" />
                </a>
            );
        },
    },
    {
        accessorKey: 'reviewer_notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan Pembimbing" />,
        cell: ({ row }) => <div>{row.getValue('reviewer_notes') || '-'}</div>,
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Upload" />,
        cell: ({ row }) => {
            const date = parseISO(row.getValue('created_at'));
            return <div>{format(date, 'dd MMMM yyyy, HH:mm', { locale: id })}</div>;
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => <ReportActionsCell row={row} />,
        enableSorting: false,
        enableHiding: false,
    },
];
