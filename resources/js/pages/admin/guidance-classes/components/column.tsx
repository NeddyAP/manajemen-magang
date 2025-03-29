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
import { formatDate } from '@/lib/utils';
import { GuidanceClass } from '@/types/guidance-class';
import { Link, router } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export const column: ColumnDef<GuidanceClass>[] = [
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
        cell: ({ row }) => (
            <Link href={route('admin.guidance-classes.show', row.original.id)} className="text-blue-500 hover:underline">
                {row.original.title}
            </Link>
        ),
    },
    {
        accessorKey: 'lecturer',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dosen" />,
        cell: ({ row }) => {
            const lecturer = row.original.lecturer;
            if (!lecturer) return '-';
            return (
                <div className="flex flex-col space-y-1">
                    <div className="font-medium">{lecturer.name}</div>
                    <div className="text-muted-foreground text-sm">
                        {lecturer.employee_number} • {lecturer.academic_position}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'start_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Mulai" />,
        cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
        accessorKey: 'room',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ruangan" />,
        cell: ({ row }) => row.original.room || '-',
    },
    {
        accessorKey: 'participants',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Peserta" />,
        cell: ({ row }) => {
            const count = row.original.participants_count || 0;
            const max = row.original.max_participants;
            return (
                <Badge variant="default">
                    {count}/{max || '∞'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const guidanceClass = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.guidance-classes.show', guidanceClass.id)}>Lihat Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.guidance-classes.edit', guidanceClass.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this guidance class?')) {
                                    router.delete(route('admin.guidance-classes.destroy', row.original.id), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className="text-red-500 focus:bg-red-100 focus:text-red-500"
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
    select: true,
    title: true,
    lecturer: true,
    start_date: true,
    room: true,
    participants: true,
    actions: true,
};
