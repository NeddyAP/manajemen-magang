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
import { SharedData } from '@/types';
import { Logbook } from '@/types/internship';
import { router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil } from 'lucide-react';

// Get user role from auth
export const useUserRole = () => {
    const { role } = usePage<SharedData>().props.auth;
    return {
        role,
        isDosen: role === 'dosen',
        isMahasiswa: role === 'mahasiswa',
        isAdmin: role === 'admin' || role === 'superadmin',
    };
};

export const createColumns = (userRole: ReturnType<typeof useUserRole>): ColumnDef<Logbook>[] => [
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
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
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

            return activities.length > 50 ? `${activities.slice(0, 50)}...` : activities;
        },
    },
    {
        accessorKey: 'supervisor_notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan Pembimbing" />,
        cell: ({ row }) => {
            const notes = row.getValue('supervisor_notes');
            const { isDosen } = userRole;
            const logbook = row.original;

            // If no notes, show appropriate message
            if (!notes || typeof notes !== 'string') {
                return (
                    <div className="flex items-center">
                        <span className="text-muted-foreground">Belum ada catatan</span>
                        {isDosen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                onClick={() => router.get(route('front.internships.logbooks.edit', [logbook.internship_id, logbook.id]))}
                                title="Tambah Catatan Pembimbing"
                            >
                                <Pencil className="h-3 w-3" />
                                <span className="sr-only">Tambah Catatan</span>
                            </Button>
                        )}
                    </div>
                );
            }

            // Show notes with edit button for dosen
            return (
                <div className="flex items-center">
                    <span>{notes.length > 50 ? `${notes.slice(0, 50)}...` : notes}</span>
                    {isDosen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                            onClick={() => router.get(route('front.internships.logbooks.edit', [logbook.internship_id, logbook.id]))}
                            title="Edit Catatan Pembimbing"
                        >
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Edit Catatan</span>
                        </Button>
                    )}
                </div>
            );
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
            const { isDosen, isMahasiswa, isAdmin } = userRole;

            return (
                <div className="flex items-center gap-2">
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

                            {/* Show edit option for mahasiswa (owner) or admin */}
                            {(isMahasiswa || isAdmin) && (
                                <DropdownMenuItem asChild>
                                    <a href={route('front.internships.logbooks.edit', [logbook.internship_id, logbook.id])}>Ubah</a>
                                </DropdownMenuItem>
                            )}

                            {/* Show edit notes option for dosen */}
                            {isDosen && (
                                <DropdownMenuItem asChild>
                                    <a href={route('front.internships.logbooks.edit', [logbook.internship_id, logbook.id])}>
                                        Edit Catatan Pembimbing
                                    </a>
                                </DropdownMenuItem>
                            )}

                            {/* Show delete option only for mahasiswa (owner) or admin */}
                            {(isMahasiswa || isAdmin) && (
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
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

// Legacy export for backwards compatibility
export const columns: ColumnDef<Logbook>[] = [];

export const initialColumnVisibility = {
    id: false,
    created_at: false,
    updated_at: false,
};
