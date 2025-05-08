'use client';

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
import { User } from '@/types/user';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../../../../components/data-table/column-header';

export const columns: ColumnDef<User>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
        cell: ({ row }) => (
            <Link href={route('admin.users.show', row.original.id)} className="text-blue-500 hover:underline">
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
        accessorKey: 'roles',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => {
            const roles = row.original.roles;
            return roles && roles.length > 0 ? roles.map((role) => role.name).join(', ') : 'N/A';
        },
        filterFn: (row, id, value: string[]) => {
            const userRoles = row.original.roles;
            if (!userRoles || userRoles.length === 0) {
                return false;
            }
            // Check if any of the user's role names are included in the filter value array
            return userRoles.some((role) => value.includes(role.name));
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;
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
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.users.show', { user: user.id })}>Lihat Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.users.edit', { user: user.id })}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                                    // router.delete(route('admin.users.destroy', { user: user.id }));
                                    // For now, log to console, actual delete needs router from props or context
                                    console.log('Delete user:', user.id);
                                }
                            }}
                            className="text-red-600"
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
    id: false,
    email: true,
    role: true,
    profile_specific_info: true, // Placeholder for role-specific info
    actions: true,
};
