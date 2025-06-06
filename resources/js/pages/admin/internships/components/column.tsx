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
import { Internship } from '@/types/internship';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileSpreadsheet, MoreHorizontal } from 'lucide-react';

export const columns: ColumnDef<Internship>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Pilih semua"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Pilih baris" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    },
    {
        accessorKey: 'user',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mahasiswa" />,
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) return '-';

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-muted-foreground text-sm">{user.email}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'lecturer',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dosen Pembimbing" />,
        cell: ({ row }) => {
            const advisor = row.original?.user?.mahasiswa_profile?.advisor as
                | {
                      name: string;
                      email: string;
                      dosen_profile?: { expertise: string };
                  }
                | undefined;
            if (!advisor) return <span className="text-muted-foreground text-sm">Belum ditentukan</span>;

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{advisor.name}</span>
                    <span className="text-muted-foreground text-sm">{advisor.email}</span>
                    {advisor.dosen_profile?.expertise && (
                        <span className="text-muted-foreground text-xs italic">{advisor.dosen_profile.expertise}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis" />,
        cell: ({ row }) => {
            const type = row.getValue('type');
            if (!type || typeof type !== 'string') return '-';

            return <Badge variant={type === 'kkl' ? 'default' : 'secondary'}>{type.toUpperCase()}</Badge>;
        },
    },
    {
        accessorKey: 'progress',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kemajuan" />,
        cell: ({ row }) => {
            const progress = row.original.progress_percentage ?? row.original.progress;

            if (progress === undefined || progress === null) return '-';

            return (
                <div className="flex items-center">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="ml-2 text-sm">{progress}%</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status');
            if (!status || typeof status !== 'string') return '-';

            const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
                waiting: { label: 'Menunggu', variant: 'secondary' },
                accepted: { label: 'Diterima', variant: 'default' },
                rejected: { label: 'Ditolak', variant: 'destructive' },
            };

            const statusInfo = statusMap[status] || { label: status, variant: 'default' };

            return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
        },
    },
    {
        accessorKey: 'company_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Perusahaan" />,
        cell: ({ row }) => {
            const companyName = row.getValue('company_name');
            const companyAddress = row.original.company_address;
            if (!companyName || typeof companyName !== 'string') return '-';

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{companyName.length > 40 ? `${companyName.slice(0, 40)}...` : companyName}</span>
                    {companyAddress && (
                        <span className="text-muted-foreground text-sm">
                            {typeof companyAddress === 'string' && companyAddress.length > 30 ? `${companyAddress.slice(0, 30)}...` : companyAddress}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'periode',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Periode" />,
        enableHiding: true,

        cell: ({ row }) => {
            const startDate = row.original.start_date;
            const endDate = row.original.end_date;

            if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') return '-';

            try {
                // Format dates to Indonesian locale
                const formattedStartDate = format(parseISO(startDate), 'PP', { locale: id });
                const formattedEndDate = format(parseISO(endDate), 'PP', { locale: id });

                return (
                    <div className="flex flex-col">
                        <span>
                            {formattedStartDate} - {formattedEndDate}
                        </span>
                    </div>
                );
            } catch (error) {
                console.error('Error formatting dates:', error);
                return `${startDate} - ${endDate}`;
            }
        },
    },
    {
        accessorKey: 'application_file',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berkas" />,
        cell: ({ row }) => {
            const filePath = row.getValue('application_file');
            if (!filePath || typeof filePath !== 'string') return '-';

            // Create a URL to the file
            const fileUrl = `/storage/${filePath}`;

            return (
                <div className="flex justify-center">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        <FileSpreadsheet className="mr-2 inline h-4 w-4" />
                    </a>
                </div>
            );
        },
    },
    {
        id: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dibuat" />,
        enableHiding: true,

        cell: ({ row }) => {
            const createdAt = row.getValue('created_at');
            if (!createdAt || typeof createdAt !== 'string') return '-';

            try {
                // Format date to Indonesian locale
                return format(parseISO(createdAt), 'PPpp', { locale: id });
            } catch (error) {
                console.error('Error formatting date:', error);
                return createdAt;
            }
        },
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Diperbarui" />,
        enableHiding: true,

        cell: ({ row }) => {
            const updatedAt = row.getValue('updated_at');
            if (!updatedAt || typeof updatedAt !== 'string') return '-';

            try {
                // Format date to Indonesian locale
                return format(parseISO(updatedAt), 'PPpp', { locale: id });
            } catch (error) {
                console.error('Error formatting date:', error);
                return updatedAt;
            }
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const internship = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(internship.id))}>Salin ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={route('admin.internships.edit', internship.id)}>Ubah</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus magang ini?')) {
                                    router.delete(route('admin.internships.destroy', internship.id), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className="text-red-500"
                        >
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const initialColumnVisibility = {
    user_id: false,
    created_at: false,
    updated_at: false,
};
