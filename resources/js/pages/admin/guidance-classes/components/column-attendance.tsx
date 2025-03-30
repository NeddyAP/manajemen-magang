import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export type Student = {
    id: number;
    name: string;
    student_number: string;
    study_program: string;
    semester: number | string;
    internship: {
        company_name: string;
        status: 'pending' | 'active' | 'ongoing' | string;
    };
    attendance: {
        attended_at: string | null;
        attendance_method: string | null;
        notes: string | null;
    };
};

export const columnAttendance: ColumnDef<Student>[] = [
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
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
        accessorKey: 'student_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="NIM" />,
        cell: ({ row }) => row.original.student_number,
    },
    {
        accessorKey: 'study_program',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Program Studi" />,
        cell: ({ row }) => row.original.study_program,
    },
    {
        accessorKey: 'semester',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Semester" />,
        cell: ({ row }) => row.original.semester,
    },
    {
        accessorKey: 'internship.status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status Magang" />,
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.internship.status === 'active' ? 'default' : row.original.internship.status === 'ongoing' ? 'secondary' : 'outline'
                }
            >
                {row.original.internship.status}
            </Badge>
        ),
    },
    {
        accessorKey: 'internship.company_name',

        header: ({ column }) => <DataTableColumnHeader column={column} title="Perusahaan" />,
        cell: ({ row }) => row.original.internship.company_name,
    },
    {
        accessorKey: 'attendance.attended_at',

        header: ({ column }) => <DataTableColumnHeader column={column} title="Kehadiran" />,
        cell: ({ row }) => (row.original.attendance.attended_at ? formatDate(row.original.attendance.attended_at) : 'Tidak Hadir'),
    },
    {
        accessorKey: 'attendance.attendance_method',

        header: ({ column }) => <DataTableColumnHeader column={column} title="Metode Absensi" />,
        cell: ({ row }) => row.original.attendance.attendance_method || '-',
    },
    {
        accessorKey: 'attendance.notes',

        header: ({ column }) => <DataTableColumnHeader column={column} title="Keterangan" />,
        cell: ({ row }) => row.original.attendance.notes || '-',
    },
];

export const initialColumnVisibility = {
    study_program: false,
    semester: false,
};
