'use client';

import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    student_number: string;
    study_program: string;
    semester: number;
    internship: {
        company_name: string;
        status: 'pending' | 'active' | 'ongoing';
    };
    attendance: {
        attended_at: string | null;
        attendance_method: string | null;
        notes: string | null;
    };
}

export const userColumns: ColumnDef<Student>[] = [
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
            if (!internship) return '-';

            const statusMap = {
                pending: 'Menunggu',
                active: 'Aktif',
                ongoing: 'Berjalan',
            };

            return (
                <div>
                    <p>{internship.company_name}</p>
                    <p className="text-muted-foreground text-xs">Status: {statusMap[internship.status]}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'attendance',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kehadiran" />,
        cell: ({ row }) => {
            const attendance = row.original.attendance;
            if (!attendance) return '-';

            if (attendance.attended_at) {
                return (
                    <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <div>
                            <p className="text-green-600">Hadir</p>
                            <p className="text-muted-foreground text-xs">
                                {format(new Date(attendance.attended_at), 'dd MMM yyyy HH:mm', { locale: id })}
                            </p>
                            <p className="text-muted-foreground text-xs">Via: {attendance.attendance_method === 'qr_code' ? 'QR Code' : 'Manual'}</p>
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
];
