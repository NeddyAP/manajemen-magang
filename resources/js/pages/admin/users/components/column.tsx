'use client';

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
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../../../../components/data-table/column-header';

// This type is used to define the shape of our data.
export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    created_at?: string;
    roles: Role[];
    [key: string]: unknown; // For any other properties that might be in the user data
}

export const columns: ColumnDef<User>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Id" />,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    },
    {
        accessorKey: 'roles',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => {
            const roles = row.original.roles;
            if (!roles || !roles.length) return '-';

            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role, index) => (
                        <Badge key={index} variant="outline">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
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
            const users = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(users.id)}>Copy user ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={route('admin.users.edit', users.id)}>Edit</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                    console.log('Deleting user:', users.id);
                                    router.delete(route('admin.users.destroy', users.id), {
                                        onSuccess: () => {
                                            console.log('Delete successful');
                                        },
                                        onError: (errors) => {
                                            console.error('Delete failed:', errors);
                                        },
                                    });
                                }
                            }}
                            className="text-red-500"
                        >
                            Delete
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
