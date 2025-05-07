import TrashAnalytics from '@/components/admin/analytics/sections/TrashAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Faq } from '@/types/faq';
import { GlobalVariable } from '@/types/global-variable';
import { GuidanceClass } from '@/types/guidance-class';
import { Internship, Logbook } from '@/types/internship';
import { Tutorial } from '@/types/tutorial';
import { User } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns, initialColumnVisibility } from './components/column';
import { ConfirmationDialog } from './components/confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sampah',
        href: '/admin/trash',
    },
];

interface TrashProps {
    users: User[];
    tutorials: Tutorial[];
    internships: Internship[];
    logbooks: Logbook[];
    reports: Report[];
    faqs: Faq[];
    globalVariables: GlobalVariable[];
    guidanceClasses: GuidanceClass[];
    meta: TableMeta;
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
            router.post(
                route('admin.trash.restore', { type: selectedType, id: dialogState.id }),
                {},
                {
                    onSuccess: () => {
                        toast.success('Data berhasil dipulihkan');
                        setDialogState({ isOpen: false, type: 'restore', id: null });
                    },
                    onError: () => {
                        toast.error('Gagal memulihkan data');
                    },
                },
            );
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

    // Define a type that matches what DataTable expects
    interface TrashItem {
        id: number;
        name: string;
        type: string;
        deleted_at: string;
        [key: string]: string | number | boolean | null | undefined;
    }

    const getCurrentData = (): TrashItem[] => {
        const option = typeOptions.find((opt) => opt.value === selectedType);
        // Filter out any items without an id or cast undefined ids to -1
        return (option?.data || []).map((item) => ({
            ...item,
            id: (item as { id: number }).id || -1, // Ensure id is always a number
        })) as TrashItem[];
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
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Analytics Section */}
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <TrashAnalytics />
                    {/* Add more analytics cards here if needed */}
                </div>
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
