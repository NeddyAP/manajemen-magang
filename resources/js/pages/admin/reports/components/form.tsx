import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { FileIcon } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Report } from '..';

interface Props {
    report: Report;
}

export default function ReportForm({ report }: Props) {
    const { data, setData, put, errors, processing } = useForm({
        id: report?.id || '',
        status: report?.status || 'pending',
        reviewer_notes: report?.reviewer_notes || '',
    });

    // Ensure status is always one of the valid values
    const handleStatusChange = (value: 'pending' | 'approved' | 'rejected') => {
        setData('status', value);
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        // Admin can only update report status
        // The actual submission logic is moved to the AlertDialogAction
    };

    const handleUpdateConfirm = () => {
        put(route('admin.reports.update', report?.id));
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Laporan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <div className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                {report?.title || 'Tidak ada data'}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="student_name">Mahasiswa</Label>
                            <div className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                {report?.user?.name || 'Tidak ada data'}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Perusahaan</Label>
                            <div className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                {report?.internship?.company_name || 'Tidak ada data'}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="version">Versi</Label>
                            <div className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                {report?.version || 'Tidak ada data'}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="version">File Laporan</Label>
                            <a href={`/storage/${report?.report_file}`} className="flex items-center text-blue-500" target="_blank">
                                <FileIcon className="mr-1 h-4 w-4" />
                                {report?.report_file}
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Laporan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        {data.status === 'rejected' && (
                            <div className="space-y-4">
                                <Label htmlFor="reviewer_notes">Alasan Penolakan</Label>
                                <Textarea
                                    id="reviewer_notes"
                                    value={data.reviewer_notes}
                                    onChange={(e) => setData('reviewer_notes', e.target.value)}
                                    placeholder="Tambahkan alasan penolakan disini..."
                                    rows={4}
                                />
                                <InputError message={errors.reviewer_notes} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.get(route('admin.reports.index'))}>
                        Batal
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" disabled={processing}>
                                Perbarui Status
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin memperbarui status laporan ini? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleUpdateConfirm} disabled={processing}>
                                    Ya, Perbarui
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </form>
    );
}
