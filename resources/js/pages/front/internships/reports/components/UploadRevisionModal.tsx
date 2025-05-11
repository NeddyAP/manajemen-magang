import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Report } from '@/types/internship';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface UploadRevisionModalProps {
    internshipId: string | number;
    report: Report;
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadRevisionModal({ internshipId, report, isOpen, onClose }: UploadRevisionModalProps) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm<{
        revised_file: File | null;
        _method: string;
    }>({
        revised_file: null,
        _method: 'POST', // Laravel expects POST for file uploads, method spoofing for PUT/PATCH if needed
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!report || !internshipId) return;

        post(route('front.internships.reports.uploadRevision', { internship: internshipId, report: report.id }), {
            onSuccess: () => {
                reset('revised_file');
                onClose();
            },
            // preserveState: true, // Might be useful depending on how you want errors handled
            // preserveScroll: true,
        });
    };

    useEffect(() => {
        if (recentlySuccessful) {
            reset('revised_file');
            // onClose(); // Already called in onSuccess
        }
    }, [recentlySuccessful, reset, onClose]);

    useEffect(() => {
        // Reset form when modal is closed or report changes
        if (!isOpen) {
            reset('revised_file');
        }
    }, [isOpen, report, reset]);

    if (!report) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Unggah Revisi Laporan</DialogTitle>
                    <DialogDescription>
                        Unggah file revisi untuk laporan "{report.title}" (Versi {report.version}).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="revised_file" className="text-right">
                                File Revisi
                            </Label>
                            <Input
                                id="revised_file"
                                type="file"
                                className="col-span-3"
                                onChange={(e) => setData('revised_file', e.target.files ? e.target.files[0] : null)}
                                required
                            />
                        </div>
                        {errors.revised_file && <div className="col-span-4 text-right text-sm text-red-500">{errors.revised_file}</div>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.revised_file}>
                            {processing ? 'Mengunggah...' : 'Unggah'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
