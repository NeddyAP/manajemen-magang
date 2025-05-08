'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

// Define the Student interface to match the backend data structure
interface Student {
    id: number;
    name: string;
    student_number: string;
    study_program: string;
    semester: number | string;
    internship: {
        company_name: string | null;
        status: string | null;
    };
    attendance: {
        attended_at: string | null;
        attendance_method: string | null;
        notes: string | null;
    };
}

export const columnAttendance: ColumnDef<Student>[] = [
    {
        accessorKey: 'student_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="NIM" />,
        cell: ({ row }) => {
            const nim = row.getValue('student_number');
            return nim || '-';
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
        cell: ({ row }) => {
            const name = row.getValue('name');
            return name || '-';
        },
    },
    {
        accessorKey: 'study_program',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Program Studi" />,
        cell: ({ row }) => {
            const program = row.getValue('study_program');
            return program || '-';
        },
    },
    {
        accessorKey: 'semester',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Semester" />,
        cell: ({ row }) => {
            const semester = row.getValue('semester');
            return semester || '-';
        },
    },
    {
        accessorKey: 'internship',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Magang" />,
        cell: ({ row }) => {
            const internship = row.original.internship;
            if (!internship || !internship.company_name) return '-';

            return (
                <div>
                    <p>{internship.company_name}</p>
                    {internship.status && <p className="text-muted-foreground text-xs">Status: {internship.status}</p>}
                </div>
            );
        },
    },
    {
        accessorKey: 'attendance',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kehadiran" />,
        cell: ({ row }) => {
            // Access the full student object to inspect the attendance data
            const student = row.original;

            // Check if a student has attended (has an attended_at timestamp)
            if (student.attendance && student.attendance.attended_at) {
                return (
                    <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <div>
                            <p className="text-green-600">Hadir</p>
                            <p className="text-muted-foreground text-xs">
                                {format(new Date(student.attendance.attended_at), 'dd MMM yyyy HH:mm', { locale: id })}
                            </p>
                            {student.attendance.attendance_method && (
                                <p className="text-muted-foreground text-xs">
                                    Via:{' '}
                                    {student.attendance.attendance_method === 'qr_code'
                                        ? 'QR Code'
                                        : student.attendance.attendance_method === 'manual'
                                          ? 'Manual'
                                          : student.attendance.attendance_method}
                                </p>
                            )}
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex items-center">
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    <p className="text-red-600">Belum Hadir</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'attendance.notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Keterangan" />,
        cell: ({ row }) => {
            const student = row.original;
            return student.attendance?.notes || '-';
        },
    },
];

// Define which columns should be hidden by default
export const initialColumnVisibility = {
    study_program: false,
    semester: false,
    'attendance.notes': false,
};
