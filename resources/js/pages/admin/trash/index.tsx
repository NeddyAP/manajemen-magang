import { DataTable } from '@/components/data-table/data-table';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { columns, initialColumnVisibility } from './components/column';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ConfirmationDialog } from './components/confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sampah',
        href: '/admin/trash',
    },
];

interface TrashProps {
    users: any[];
    tutorials: any[];
    internships: any[];
    logbooks: any[];
    reports: any[];
    faqs: any[];
    globalVariables: any[];
    guidanceClasses: any[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export default function Trash({ users, tutorials, internships, logbooks, reports, faqs, globalVariables, guidanceClasses, meta }: TrashProps) {
    const [selectedType, setSelectedType] = useState('users');
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        type: 'restore' | 'delete';
        id: number | null;
    }>({
        isOpen: false,
        type: 'restore',
        id: null,
    });

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
    };

    const handleRestore = (id: number) => {
        setDialogState({
            isOpen: true,
            type: 'restore',
            id,
        });
    };

    const handleForceDelete = (id: number) => {
        setDialogState({
            isOpen: true,
            type: 'delete',
            id,
        });
    };

    const handleConfirm = () => {
        if (!dialogState.id) return;

        if (dialogState.type === 'restore') {
            router.post(route('admin.trash.restore', { type: selectedType, id: dialogState.id }), {}, {
                onSuccess: () => {
                    toast.success('Data berhasil dipulihkan');
                    setDialogState({ isOpen: false, type: 'restore', id: null });
                },
                onError: () => {
                    toast.error('Gagal memulihkan data');
                },
            });
        } else {
            router.delete(route('admin.trash.force-delete', { type: selectedType, id: dialogState.id }), {
                onSuccess: () => {
                    toast.success('Data berhasil dihapus permanen');
                    setDialogState({ isOpen: false, type: 'delete', id: null });
                },
                onError: () => {
                    toast.error('Gagal menghapus data');
                },
            });
        }
    };

    const typeOptions = [
        { value: 'users', label: 'Pengguna', data: users, count: users.length },
        { value: 'tutorials', label: 'Tutorial', data: tutorials, count: tutorials.length },
        { value: 'internships', label: 'Magang', data: internships, count: internships.length },
        { value: 'logbooks', label: 'Logbook', data: logbooks, count: logbooks.length },
        { value: 'reports', label: 'Laporan', data: reports, count: reports.length },
        { value: 'faqs', label: 'FAQ', data: faqs, count: faqs.length },
        { value: 'globalVariables', label: 'Variabel Global', data: globalVariables, count: globalVariables.length },
        { value: 'guidanceClasses', label: 'Kelas Bimbingan', data: guidanceClasses, count: guidanceClasses.length },
    ];

    const getCurrentData = () => {
        const option = typeOptions.find(opt => opt.value === selectedType);
        return option?.data || [];
    };

    const getDialogContent = () => {
        if (dialogState.type === 'restore') {
            return {
                title: 'Pulihkan Data',
                description: 'Apakah Anda yakin ingin memulihkan data ini?',
                confirmText: 'Pulihkan',
                cancelText: 'Batal',
            };
        }
        return {
            title: 'Hapus Permanen',
            description: 'Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Hapus Permanen',
            cancelText: 'Batal',
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sampah" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                    {typeOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={selectedType === option.value ? 'default' : 'outline'}
                            onClick={() => handleTypeChange(option.value)}
                            className="flex items-center gap-2"
                        >
                            {option.label}
                            <Badge variant="secondary" className="ml-2">
                                {option.count}
                            </Badge>
                        </Button>
                    ))}
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns({
                            handleRestore,
                            handleForceDelete,
                            type: selectedType,
                        })}
                        data={getCurrentData()}
                        meta={meta}
                        initialColumnVisibility={initialColumnVisibility}
                    />
                </div>
            </div>
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={() => setDialogState({ isOpen: false, type: 'restore', id: null })}
                onConfirm={handleConfirm}
                {...getDialogContent()}
            />
        </AppLayout>
    );
} 