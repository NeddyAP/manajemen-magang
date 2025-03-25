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
import { FormEventHandler, useState } from 'react';

interface Internship {
    id?: number;
    user_id?: number;
    type: 'kkl' | 'kkn';
    application_file?: string;
    company_name: string;
    company_address: string;
    start_date: string;
    end_date: string;
    status?: 'waiting' | 'accepted' | 'rejected';
    progress?: string;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    internship?: Internship;
    mode: 'create' | 'edit';
    disabled?: boolean;
}

export default function InternshipForm({ internship, mode, disabled = false }: Props) {
    const { data, setData, post, put, errors, processing, setError, clearErrors } = useForm<any>({
        type: internship?.type || 'kkl',
        application_file: '',
        company_name: internship?.company_name || '',
        company_address: internship?.company_address || '',
        start_date: internship?.start_date || '',
        end_date: internship?.end_date || '',
    });

    // Store parsed dates for the calendar UI
    const [startDate, setStartDate] = useState<Date | undefined>(
        data.start_date ? new Date(data.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        data.end_date ? new Date(data.end_date) : undefined
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('application_file', 'Ukuran file harus kurang dari 2MB');
                return;
            }

            // Check file type (only PDF)
            if (file.type !== 'application/pdf') {
                setError('application_file', 'Hanya file PDF yang diizinkan');
                return;
            }

            clearErrors('application_file');
            setData('application_file', file);
        }
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        if (mode === 'create') {
            post(route('front.internships.applicants.store'));
        } else {
            put(route('front.internships.applicants.update', internship?.id));
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="type">Jenis Magang</Label>
                        <RadioGroup
                            value={data.type}
                            onValueChange={(value: 'kkl' | 'kkn') => setData('type', value)}
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
                        <InputError message={errors.type} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="application_file">Berkas Aplikasi (PDF)</Label>
                        <Input id="application_file" type="file" accept=".pdf" onChange={handleFileChange} disabled={disabled} />
                        <p className="text-muted-foreground text-xs">Unggah surat lamaran Anda dalam format PDF (maks 2MB)</p>
                        {mode === 'edit' && internship?.application_file && (
                            <div className="flex items-center gap-2 text-sm">
                                <span>File saat ini:</span>
                                <a
                                    href={route('front.internships.applicants.download', internship.id)}
                                    className="text-primary underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Unduh PDF
                                </a>
                            </div>
                        )}
                        <InputError message={errors.application_file} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="company_name">Nama Perusahaan/Institusi</Label>
                        <Input
                            id="company_name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            disabled={disabled}
                        />
                        <InputError message={errors.company_name} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="company_address">Alamat Perusahaan/Institusi</Label>
                        <Textarea
                            id="company_address"
                            value={data.company_address}
                            onChange={(e) => setData('company_address', e.target.value)}
                            disabled={disabled}
                        />
                        <InputError message={errors.company_address} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <Label htmlFor="start_date">Tanggal Mulai</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!startDate && 'text-muted-foreground'
                                            }`}
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
                                            setData('start_date', date ? format(date, 'yyyy-MM-dd') : '');
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.start_date} />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="end_date">Tanggal Selesai</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!endDate && 'text-muted-foreground'
                                            }`}
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
                                            setData('end_date', date ? format(date, 'yyyy-MM-dd') : '');
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.end_date} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('front.internships.applicants.index'))}>
                    Kembali ke Daftar Aplikasi
                </Button>
                {!disabled && (
                    <Button type="submit" disabled={processing}>
                        {mode === 'create' ? 'Ajukan Aplikasi' : 'Perbarui Aplikasi'}
                    </Button>
                )}
            </div>
        </form>
    );
}