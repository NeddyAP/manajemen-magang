'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
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
import { Logbook } from '@/types/internship';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';

export const columns: ColumnDef<Logbook>[] = [
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
        accessorKey: 'internship.user.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Mahasiswa" />,
        cell: ({ row }) => {
            const user = row.original.internship?.user;
            return user?.name || '-';
        },
    },
    {
        accessorKey: 'internship.user.mahasiswaProfile.advisor.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pembimbing" />,
        cell: ({ row }) => {
            const advisor = row.original.internship?.user?.mahasiswaProfile?.advisor;
            return advisor?.name || '-';
        },
    },
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        cell: ({ row }) => {
            const date = row.getValue('date');
            if (!date || typeof date !== 'string') return '-';

            return format(new Date(date), 'dd MMMM yyyy', { locale: id });
        },
    },
    {
        accessorKey: 'activities',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Aktivitas" />,
        cell: ({ row }) => {
            const activities = row.getValue('activities');
            if (!activities || typeof activities !== 'string') return '-';

            return activities.length > 40 ? `${activities.slice(0, 40)}...` : activities;
        },
    },
    {
        accessorKey: 'supervisor_notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan Pembimbing" />,
        cell: ({ row }) => {
            const notes = row.getValue('supervisor_notes');
            if (!notes || typeof notes !== 'string') return '-';

            return notes.length > 40 ? `${notes.slice(0, 40)}...` : notes;
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dibuat" />,
        enableHiding: true,
        cell: ({ row }) => {
            const createdAt = row.getValue('created_at');
            if (!createdAt || typeof createdAt !== 'string') return '-';

            return format(new Date(createdAt), 'dd MMMM yyyy HH:mm', { locale: id });
        },
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dibuat" />,
        enableHiding: true,
        cell: ({ row }) => {
            const createdAt = row.getValue('updated_at');
            if (!createdAt || typeof createdAt !== 'string') return '-';

            return format(new Date(createdAt), 'dd MMMM yyyy HH:mm', { locale: id });
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const logbook = row.original;

            return (
                // logbook detail with eye icon
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                router.get(`/admin/logbooks/${logbook.id}`);
                            }}
                        >
                            Lihat
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const initialColumnVisibility = {
    created_at: false,
    updated_at: false,
};
