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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../../../../components/data-table/column-header';
import { GlobalVariable } from '..';

export const columns: ColumnDef<GlobalVariable>[] = [
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
        accessorKey: 'key',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
        cell: ({ row }) => {
            const key = row.getValue('key');
            const slug = row.original.slug;
            if (!key || typeof key !== 'string') return '-';
            if (!slug || typeof slug !== 'string') return '-';

            return <div className='flex flex-col'>
                {key.length > 40 ? `${key.slice(0, 40)}...` : key}
                <p className='text-gray-500 text-wrap'>
                    {slug.length > 40 ? `${slug.slice(0, 40)}...` : slug}
                </p>
            </div>;
        },
    },
    {
        accessorKey: 'value',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
        cell: ({ row }) => {
            const answer = row.getValue('value');
            if (!answer || typeof answer !== 'string') return '-';

            return answer.length > 40 ? `${answer.slice(0, 40)}...` : answer;
        },
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Deskripsi" />,
        cell: ({ row }) => {
            const answer = row.getValue('description');
            if (!answer || typeof answer !== 'string') return '-';

            return answer.length > 40 ? `${answer.slice(0, 40)}...` : answer;
        },
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        // add radio toogle switch to enable/disable in boolean
        cell: ({ row }) => {
            const statusValue = row.getValue('is_active');
            const status = typeof statusValue === 'boolean' ? statusValue : false;
            return (
                <div className="flex items-center space-x-3">
                    <Switch
                        id="airplane-mode"
                        checked={status}
                        onCheckedChange={(value) => {
                            const updatedStatus = value;
                            router.post(route('admin.global-variables.toggle', row.original.id), { status: updatedStatus }, { preserveScroll: true });
                        }}
                    />
                    <Label htmlFor="airplane-mode">{status ? 'Aktif' : 'Tidak Aktif'}</Label>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
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
            const globalVariables = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(globalVariables.key)}>Copy Key</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={route('admin.global-variables.edit', globalVariables.id)}>Edit</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this global variable?')) {
                                    router.delete(route('admin.global-variables.destroy', globalVariables.id), {
                                        preserveScroll: true,
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
