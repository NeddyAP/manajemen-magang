import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Internship } from '..';

interface Props {
    internship?: Internship;
    mode: 'create' | 'edit';
    disabled?: boolean;
}

type InternshipType = 'kkl' | 'kkn';

interface InternshipFormData {
    type: InternshipType;
    application_file?: File | null;
    company_name: string;
    company_address: string;
    start_date: string;
    end_date: string;
    _method: string;
    [key: string]: string | File | null | InternshipType | undefined;
}

export default function InternshipForm({ internship, mode, disabled = false }: Props) {
    const form = useForm<InternshipFormData>({
        type: (internship?.type as InternshipType) ?? 'kkl',
        application_file: null,
        company_name: internship?.company_name ?? '',
        company_address: internship?.company_address ?? '',
        start_date: internship?.start_date ?? '',
        end_date: internship?.end_date ?? '',
        _method: mode === 'edit' ? 'PUT' : 'POST',
    });

    // Store the current file path for display
    const [currentFile, setCurrentFile] = useState(internship?.application_file || '');

    // When editing and no new file is selected, remove application_file from form data
    useEffect(() => {
        if (mode === 'edit' && !form.data.application_file && form.data.application_file !== undefined) {
            form.setData('application_file', undefined);
        }
    }, [mode, form]);

    // Store parsed dates for the calendar UI
    const [startDate, setStartDate] = useState<Date | undefined>(form.data.start_date ? new Date(form.data.start_date as string) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(form.data.end_date ? new Date(form.data.end_date as string) : undefined);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        const url = mode === 'create' ? route('front.internships.applicants.store') : route('front.internships.applicants.update', internship?.id);

        // Remove application_file from form data if no new file is selected in edit mode
        if (mode === 'edit' && !form.data.application_file) {
            form.setData('application_file', undefined);
            form.post(url, {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            form.post(url, {
                preserveScroll: true,
                forceFormData: true,
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        form.setData('application_file', file);
        if (file) {
            setCurrentFile(file.name);
        }
    };

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data">
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="type">Jenis Magang</Label>
                        <RadioGroup
                            value={form.data.type as string}
                            onValueChange={(value: InternshipType) => form.setData('type', value)}
                            className="flex items-center space-x-4"
                            id="type"
                            disabled={disabled}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="kkl" id="kkl" disabled={disabled} />
                                <Label htmlFor="kkl">KKL (Kuliah Kerja Lapangan)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="kkn" id="kkn" disabled={disabled} />
                                <Label htmlFor="kkn">KKN (Kuliah Kerja Nyata)</Label>
                            </div>
                        </RadioGroup>
                        <InputError message={form.errors.type} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="application_file">File tutorial{mode === 'create' ? '*' : ''}</Label>
                        <Input id="application_file" type="file" accept=".pdf" disabled={disabled} onChange={handleFileChange} />
                        {currentFile && (
                            <p className="text-sm text-gray-500">
                                File saat ini: {currentFile}
                                {mode === 'edit' && internship?.application_file && (
                                    <a
                                        href={route('front.internships.applicants.download', internship.id)}
                                        className="ml-2 text-blue-500 hover:text-blue-700"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        (Download)
                                    </a>
                                )}
                            </p>
                        )}
                        <InputError message={form.errors.application_file} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="company_name">Nama Perusahaan/Institusi</Label>
                        <Input
                            id="company_name"
                            value={form.data.company_name as string}
                            onChange={(e) => form.setData('company_name', e.target.value)}
                            disabled={disabled}
                        />
                        <InputError message={form.errors.company_name} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="company_address">Alamat Perusahaan/Institusi</Label>
                        <Textarea
                            id="company_address"
                            value={form.data.company_address as string}
                            onChange={(e) => form.setData('company_address', e.target.value)}
                            disabled={disabled}
                        />
                        <InputError message={form.errors.company_address} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <Label htmlFor="start_date">Tanggal Mulai</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                                        disabled={disabled}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, 'PPP') : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => {
                                            setStartDate(date);
                                            form.setData('start_date', date ? format(date, 'yyyy-MM-dd') : '');
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={form.errors.start_date} />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="end_date">Tanggal Selesai</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!endDate && 'text-muted-foreground'}`}
                                        disabled={disabled}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, 'PPP') : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => {
                                            setEndDate(date);
                                            form.setData('end_date', date ? format(date, 'yyyy-MM-dd') : '');
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={form.errors.end_date} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('front.internships.applicants.index'))}>
                    Kembali ke Daftar Aplikasi
                </Button>
                {!disabled && (
                    <Button type="submit" disabled={form.processing}>
                        {mode === 'create' ? 'Ajukan Aplikasi' : 'Perbarui Aplikasi'}
                    </Button>
                )}
            </div>
        </form>
    );
}
