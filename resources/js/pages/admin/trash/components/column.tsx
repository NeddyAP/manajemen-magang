import { Button } from '@/components/ui/button';
import { type Column, type ColumnDef, type Row } from '@tanstack/react-table';
import { ArrowUpDown, Trash2, Undo2 } from 'lucide-react';

interface ColumnProps {
    handleRestore: (id: number) => void;
    handleForceDelete: (id: number) => void;
    type: string;
}

export const initialColumnVisibility = {
    id: false,
    created_at: false,
    updated_at: false,
    deleted_at: true,
};

type DataItem = {
    id: number;
    name?: string;
    email?: string;
    role?: string;
    title?: string;
    description?: string;
    vacancy?: number;
    deadline?: string;
    status?: string;
    deleted_at?: string;
    content?: string;
    activities?: string;
    question?: string;
    answer?: string;
    key?: string;
    value?: string;
    company_name?: string;
    company_address?: string;
    date?: string;
    user?: { name: string; id: number };
    internship?: { company_name: string; id: number };
    [key: string]: string | number | boolean | object | null | undefined;
};

const getColumns = ({ handleRestore, handleForceDelete, type }: ColumnProps): ColumnDef<DataItem>[] => {
    const baseColumns = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'deleted_at',
            header: 'Tanggal Dihapus',
            cell: ({ row }: { row: Row<DataItem> }) => {
                const date = new Date(row.getValue('deleted_at'));
                return date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
            },
        },
        {
            id: 'actions',
            cell: ({ row }: { row: Row<DataItem> }) => {
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleRestore(row.original.id)}>
                            <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleForceDelete(row.original.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const typeColumns = {
        users: [
            {
                accessorKey: 'name',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Nama
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email',
            },
        ],
        tutorials: [
            {
                accessorKey: 'title',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Judul
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'content',
                header: 'Konten',
                cell: ({ row }: { row: Row<DataItem> }) => {
                    const content = row.getValue('content') as string;
                    return content.length > 100 ? content.substring(0, 100) + '...' : content;
                },
            },
        ],
        internships: [
            {
                accessorKey: 'company_name',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Nama Perusahaan
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'company_address',
                header: 'Alamat Perusahaan',
            },
            {
                accessorKey: 'user.name',
                header: 'Nama Mahasiswa',
            },
        ],
        logbooks: [
            {
                accessorKey: 'internship.company_name',
                header: 'Perusahaan',
            },
            {
                accessorKey: 'date',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Tanggal
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }: { row: Row<DataItem> }) => {
                    const date = new Date(row.getValue('date'));
                    return date.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    });
                },
            },
            {
                accessorKey: 'activities',
                header: 'Aktivitas',
                cell: ({ row }: { row: Row<DataItem> }) => {
                    const activities = row.getValue('activities') as string;
                    return activities.length > 100 ? activities.substring(0, 100) + '...' : activities;
                },
            },
        ],
        reports: [
            {
                accessorKey: 'title',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Judul
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'user.name',
                header: 'Nama Mahasiswa',
            },
            {
                accessorKey: 'internship.company_name',
                header: 'Perusahaan',
            },
        ],
        faqs: [
            {
                accessorKey: 'question',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Pertanyaan
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'answer',
                header: 'Jawaban',
                cell: ({ row }: { row: Row<DataItem> }) => {
                    const answer = row.getValue('answer') as string;
                    return answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
                },
            },
        ],
        globalVariables: [
            {
                accessorKey: 'key',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Kunci
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'value',
                header: 'Nilai',
                cell: ({ row }: { row: Row<DataItem> }) => {
                    const value = row.getValue('value') as string;
                    return value.length > 100 ? value.substring(0, 100) + '...' : value;
                },
            },
        ],
        guidanceClasses: [
            {
                accessorKey: 'title',
                header: ({ column }: { column: Column<DataItem> }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Judul
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'description',
                header: 'Deskripsi',
                cell: ({ row }: { row: Row<DataItem> }) => {
                    const description = row.getValue('description') as string;
                    return description.length > 100 ? description.substring(0, 100) + '...' : description;
                },
            },
        ],
    };

    return [...(typeColumns[type as keyof typeof typeColumns] || []), ...baseColumns];
};

export const columns = (props: ColumnProps): ColumnDef<DataItem>[] => getColumns(props);
