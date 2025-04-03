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
import { GuidanceClass } from '@/types/guidance-class';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarCheck, CalendarClock, MoreHorizontal, UserCheck } from 'lucide-react';

export const columns: ColumnDef<GuidanceClass>[] = [
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
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Judul Kelas" />,
        cell: ({ row }) => {
            const title = row.getValue('title');
            if (!title || typeof title !== 'string') return '-';

            return title;
        },
    },
    {
        accessorKey: 'lecturer',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dosen Pembimbing" />,
        cell: ({ row }) => {
            const lecturer = row.original.lecturer;
            if (!lecturer) return '-';

            return (
                <div>
                    <p className="font-medium">{lecturer.name}</p>
                    <p className="text-muted-foreground text-xs">{lecturer.academic_position}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'start_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Mulai" />,
        cell: ({ row }) => {
            const startDate = row.getValue('start_date');
            if (!startDate || typeof startDate !== 'string') return '-';

            return format(new Date(startDate), 'dd MMMM yyyy HH:mm', { locale: id });
        },
    },
    {
        accessorKey: 'end_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Selesai" />,
        cell: ({ row }) => {
            const endDate = row.getValue('end_date');
            if (!endDate || typeof endDate !== 'string') return '-';

            return format(new Date(endDate), 'dd MMMM yyyy HH:mm', { locale: id });
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const startDate = row.getValue('start_date') as string;
            const endDate = row.getValue('end_date') as string | null;
            const now = new Date();

            let status = (
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500">Akan Datang</span>
                </div>
            );

            if (new Date(startDate) <= now) {
                if (!endDate || new Date(endDate) >= now) {
                    status = (
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Sedang Berlangsung</span>
                        </div>
                    );
                } else {
                    status = (
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-500">Selesai</span>
                        </div>
                    );
                }
            }

            return status;
        },
    },
    {
        accessorKey: 'room',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ruangan" />,
        enableHiding: true,
        cell: ({ row }) => {
            const room = row.getValue('room');
            return room || '-';
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionsCell row={row} />,
    },
];

export const initialColumnVisibility = {
    id: false,
    room: false,
};

// Create a proper React component for the actions cell
const ActionsCell = ({ row }: { row: { original: GuidanceClass } }) => {
    const { user } = usePage<SharedData>().props.auth;
    const guidanceClass = row.original;
    const isDosen = user?.roles?.[0]?.name === 'dosen';
    const isLecturer = isDosen && guidanceClass.lecturer && user.id === guidanceClass.lecturer.id;

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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(guidanceClass.id))}>Salin ID</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={route('front.internships.guidance-classes.show', guidanceClass.id)}>Lihat Detail</Link>
                </DropdownMenuItem>
                {isLecturer && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={route('front.internships.guidance-classes.edit', guidanceClass.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus kelas bimbingan ini?')) {
                                    router.delete(route('front.internships.guidance-classes.destroy', guidanceClass.id), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            Hapus
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
