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
import { FileSpreadsheet, MoreHorizontal } from 'lucide-react';
import { Tutorial } from '..';
import { DataTableColumnHeader } from '../../../../components/data-table/column-header';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const columns: ColumnDef<Tutorial>[] = [
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
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Judul" />,
        cell: ({ row }) => {
            const title = row.getValue('title');
            if (!title || typeof title !== 'string') return '-';

            return title.length > 30 ? `${title.slice(0, 30)}...` : title;
        }
    },
    {
        accessorKey: 'content',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Konten" />,
        cell: ({ row }) => {
            const content = row.getValue('content');
            if (!content || typeof content !== 'string') return '-';

            return content.length > 30 ? `${content.slice(0, 30)}...` : content;
        },
    },
    {
        accessorKey: 'access_level',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Akses Level" />,
        // different access level different badge
        cell: ({ row }) => {
            const accessLevel = row.getValue('access_level');
            if (!accessLevel || typeof accessLevel !== 'string') return '-';

            return (
                <Badge
                    variant={accessLevel === 'all' ? 'outline' : accessLevel === 'dosen' ? 'secondary' : 'default'}
                    className="capitalize"
                >
                    {accessLevel}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'file_path',
        header: ({ column }) => <DataTableColumnHeader column={column} title="File" />,
        cell: ({ row }) => {
            const filePath = row.getValue('file_path');
            if (!filePath || typeof filePath !== 'string') return '-';

            // Create a URL to the file
            const fileUrl = `/storage/${filePath}`;
            const fileName = row.original.file_name || filePath.split('/').pop() || 'Download';

            return (
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    <FileSpreadsheet className="h-4 w-4 mr-2 inline" />
                    {fileName}
                </a>
            );
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
                            router.post(route('admin.tutorials.toggle', row.original.id), { status: updatedStatus }, { preserveScroll: true });
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
            const tutorials = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tutorials.title)}>Copy Answer ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={route('admin.tutorials.edit', tutorials.id)}>Edit</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this tutorial?')) {
                                    router.delete(route('admin.tutorials.destroy', tutorials.id), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className="text-red-500"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu >
            );
        },
    },
];

export const initialColumnVisibility = {
    user_name: false,
    created_at: false,
    updated_at: false,
};
