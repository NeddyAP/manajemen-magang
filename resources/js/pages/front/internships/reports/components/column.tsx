'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
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
import { type Report } from '@/types/internship';
import { Link, router } from '@inertiajs/react';
import { type ColumnDef, type VisibilityState } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileSpreadsheet, MoreHorizontal } from 'lucide-react';

export const initialColumnVisibility: VisibilityState = {
    id: false,
    updated_at: false,
};

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
        cell: ({ row }) => {
            const report = row.original;
            const canEdit = report.status !== 'approved';

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
                    router.delete(route('front.internships.reports.destroy', { internship: report.internship_id, report: report.id }), {
                        preserveScroll: true,
                    });
                }
            };

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
                        <DropdownMenuItem asChild>
                            <a href={`/storage/${report.report_file}`} target="_blank" rel="noopener noreferrer">
                                Unduh
                            </a>
                        </DropdownMenuItem>
                        {canEdit && (
                            <DropdownMenuItem asChild>
                                <Link href={route('front.internships.reports.edit', { internship: report.internship_id, report: report.id })}>
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
];
