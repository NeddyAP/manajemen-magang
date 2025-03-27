'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import { Logbook } from '..';

export const columns: ColumnDef<Logbook>[] = [
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

            return activities.length > 100 ? `${activities.slice(0, 100)}...` : activities;
        },
    },
    {
        accessorKey: 'supervisor_notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan Pembimbing" />,
        cell: ({ row }) => {
            const notes = row.getValue('supervisor_notes');
            if (!notes || typeof notes !== 'string') return '-';

            return notes.length > 100 ? `${notes.slice(0, 100)}...` : notes;
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
        id: 'actions',
        cell: ({ row }) => {
            const logbook = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(logbook.id))}>Salin ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={route('front.internships.logbooks.edit', [logbook.internship_id, logbook.id])}>Ubah</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus logbook ini?')) {
                                    router.delete(route('front.internships.logbooks.destroy', [logbook.internship_id, logbook.id]), {
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
    created_at: false,
    updated_at: false,
};
