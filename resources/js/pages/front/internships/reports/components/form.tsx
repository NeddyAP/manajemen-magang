import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Report } from '@/types/internship';
import { router, useForm } from '@inertiajs/react';
import { FileWarning } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ReportFormProps {
    internshipId: number | undefined;
    report?: Report;
    mode: 'create' | 'edit';
}

export default function ReportForm({ internshipId, report, mode }: ReportFormProps) {
    const isEditMode = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset, progress } = useForm<{
        title: string;
        report_file: File | null;
        _method?: string;
    }>({
        title: report?.title ?? '',
        report_file: null,
        _method: isEditMode ? 'PUT' : undefined,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditMode && report) {
            put(route('front.internships.reports.update', { internship: internshipId, report: report.id }), {
                onSuccess: () => reset('report_file'),
            });
        } else {
            post(route('front.internships.reports.store', internshipId), {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <form onSubmit={submit}>
            <Card>
                <CardContent className="space-y-4">
                    {/* Display reviewer notes if in edit mode and notes exist */}
                    {isEditMode && report?.reviewer_notes && (
                        <Alert variant="destructive">
                            <FileWarning className="h-4 w-4" />
                            <AlertTitle>Catatan Reviewer</AlertTitle>
                            <AlertDescription>{report.reviewer_notes}</AlertDescription>
                        </Alert>
                    )}

                    {/* Display current file info in edit mode */}
                    {isEditMode && report?.report_file && (
                        <div className="text-muted-foreground text-sm">
                            File saat ini:{' '}
                            <a
                                href={`/storage/${report.report_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {report.report_file.split('/').pop()}
                            </a>{' '}
                            (Versi {report.version})<p className="text-xs italic">Kosongkan input file jika tidak ingin mengganti.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Laporan</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required disabled={processing} />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="report_file">File Laporan (PDF, DOC, DOCX - Max 5MB)</Label>
                        <Input
                            id="report_file"
                            type="file"
                            onChange={(e) => setData('report_file', e.target.files ? e.target.files[0] : null)}
                            required={!isEditMode}
                            disabled={processing}
                            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                        {progress && (
                            <progress value={progress.percentage} max="100">
                                {progress.percentage}%
                            </progress>
                        )}
                        <InputError message={errors.report_file} className="mt-2" />
                    </div>
                </CardContent>
            </Card>
            <div className="mt-6 flex justify-end gap-4">
                {/* Pass internshipId to the index route */}
                <Button type="button" variant="outline" onClick={() => router.get(route('front.internships.reports.index', internshipId))}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Buat Laporan' : 'Update Laporan'}
                </Button>
            </div>
        </form>
    );
}
