import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Internship } from '@/types/internship';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { PageProps } from '@/types';
import { User } from '@/types/user'; // Import User from @/types/user
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface FormProps {
    internship?: Internship;
    mode: 'create' | 'edit';
    disabled?: boolean;
}

type InternshipType = 'kkl' | 'kkn';

export default function InternshipForm({ internship, mode, disabled = false }: FormProps) {
    const { auth } = usePage<PageProps<{ user: User }>>().props;
    const typedUser = auth.user as User & { mahasiswa_profile?: { student_number?: string } }; // Changed student_number to student_number

    const studentName = typedUser?.name ?? '';
    const studentNim = typedUser?.mahasiswa_profile?.student_number ?? ''; // Changed student_number to student_number
    console.log('Student:', typedUser?.mahasiswa_profile);
    const [activeTab, setActiveTab] = useState('form');

    const internshipTypes = [
        { value: 'kkl', label: 'Kuliah Kerja Lapang (KKL)' },
        { value: 'kkn', label: 'Kuliah Kerja Nyata (KKN)' },
    ];

    const { data, setData, post, processing, errors, clearErrors, transform, setError, reset } = useForm({
        type: (internship?.type as InternshipType) ?? 'kkl',
        application_file: null as File | null | undefined,
        company_name: internship?.company_name ?? '',
        company_address: internship?.company_address ?? '',
        start_date: internship?.start_date ?? '',
        end_date: internship?.end_date ?? '',
        _method: mode === 'edit' ? 'PUT' : 'POST',
    });

    const [currentFile, setCurrentFile] = useState(internship?.application_file || '');
    const [startDate, setStartDate] = useState<Date | undefined>(data.start_date ? new Date(data.start_date as string) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(data.end_date ? new Date(data.end_date as string) : undefined);

    useEffect(() => {
        if (mode === 'edit' && data.application_file === null) {
            // Ensure 'undefined' if no new file is picked in edit mode
        }
    }, [mode, data.application_file]);

    const handleNextTab = () => {
        clearErrors();
        let formIsValid = true;
        const newErrors: Record<string, string> = {};

        if (activeTab === 'form') {
            if (!data.type) {
                newErrors.type = 'Program harus dipilih.';
                formIsValid = false;
            }
            if (!data.company_name) {
                newErrors.company_name = 'Nama Perusahaan/Institusi harus diisi.';
                formIsValid = false;
            }
            if (!data.company_address) {
                newErrors.company_address = 'Alamat Perusahaan/Institusi harus diisi.';
                formIsValid = false;
            }
            if (!data.start_date) {
                newErrors.start_date = 'Tanggal mulai harus diisi.';
                formIsValid = false;
            }
            if (!data.end_date) {
                newErrors.end_date = 'Tanggal selesai harus diisi.';
                formIsValid = false;
            }

            if (!formIsValid) {
                Object.keys(newErrors).forEach(key => {
                    setError(key as keyof typeof data, newErrors[key]);
                });
                toast.error('Harap lengkapi semua kolom yang wajib diisi pada Formulir Pengajuan.');
                return;
            }
            setActiveTab('upload');
        } else if (activeTab === 'upload') {
            if (mode === 'create' && !data.application_file) {
                newErrors.application_file = 'Berkas Lamaran harus diunggah.';
                formIsValid = false;
            }
            // In 'edit' mode, application_file is not strictly required to proceed
            // if the user doesn't want to change the existing file.
            // The backend will handle keeping the old file if no new one is submitted.
            // A new file (instanceof File) would be validated by the backend if provided.

            if (!formIsValid) {
                setError('application_file', newErrors.application_file);
                toast.error('Harap unggah Berkas Lamaran.');
                return;
            }
            setActiveTab('confirm');
        }
    };

    const handlePreviousTab = () => {
        if (activeTab === 'confirm') setActiveTab('upload');
        else if (activeTab === 'upload') setActiveTab('form');
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors(); // Clear previous errors

        const url = mode === 'create' ? route('front.internships.applicants.store') : route('front.internships.applicants.update', internship?.id);

        // For 'edit' mode, if application_file is still the initial 'null' (and not a new File object),
        // send it as 'undefined' so the backend doesn't try to validate/process an empty file.
        // If a new file was selected, data.application_file would be a File object.
        transform((currentFormData) => {
            // Exclude nama_mahasiswa and nim_mahasiswa from submission
            const { nama_mahasiswa, nim_mahasiswa, ...submissionData } = currentFormData as any; // Use 'as any' for simplicity here or define a more specific type

            if (mode === 'edit' && submissionData.application_file === null) {
                submissionData.application_file = undefined;
            }
            return submissionData;
        });

        post(url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('application_file', file);
        if (file) {
            setCurrentFile(file.name);
        } else {
            // If file is cleared, reset to original if in edit mode, or empty if create
            setCurrentFile(mode === 'edit' ? internship?.application_file || '' : '');
        }
    };

    const getFileName = (filePath: string | undefined) => {
        if (!filePath) return 'Tidak ada berkas lama.';
        return filePath.split('/').pop() || filePath;
    };

    return (
        <div className="flex flex-col md:flex-row gap-x-0 md:gap-x-8 w-full">
            {/* Left Stepper Column */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg hidden md:flex flex-col">
                <h2 className="text-xl font-semibold mb-6">Tahapan Pengajuan</h2>
                <div className="space-y-4">
                    {[
                        { id: 'form', label: 'Formulir Pengajuan' },
                        { id: 'upload', label: 'File Upload' },
                        { id: 'confirm', label: 'Konfirmasi' },
                    ].map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center space-x-3 ${activeTab === step.id ? 'opacity-100' : 'opacity-50'}`}
                        >
                            <div
                                className={`w-3 h-3 rounded-full ${activeTab === step.id ? 'bg-white ring-2 ring-offset-2 ring-offset-blue-700 ring-white' : 'border-2 border-blue-300'
                                    }`}
                            ></div>
                            <span className={activeTab === step.id ? 'font-medium' : ''}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Form Column */}
            <div className="w-full md:w-2/3 lg:w-3/4">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Formulir Pengajuan Magang</h1>
                    <p className="text-muted-foreground mt-1">
                        Lengkapi semua informasi yang diperlukan pada setiap tahapan.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="hidden"> {/* Visually hidden but accessible for tab functionality if needed */}
                        <TabsTrigger value="form">Formulir</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="confirm">Konfirmasi</TabsTrigger>
                    </TabsList>

                    <TabsContent value="form">
                        <form onSubmit={(e) => { e.preventDefault(); handleNextTab(); }} encType="multipart/form-data">
                            <Card className="shadow-md">
                                <CardContent className="space-y-5 pt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Program dipilih</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value: string) => setData('type', value as InternshipType)}
                                            disabled={disabled || processing}
                                        >
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Pilih program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kkl">Kuliah Kerja Lapang (KKL)</SelectItem>
                                                <SelectItem value="kkn">Kuliah Kerja Nyata (KKN)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.type} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Nama Perusahaan/Institusi</Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            disabled={disabled || processing}
                                            placeholder="Contoh: PT. Teknologi Nusantara"
                                        />
                                        <InputError message={errors.company_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company_address">Alamat Perusahaan/Institusi</Label>
                                        <Textarea
                                            id="company_address"
                                            value={data.company_address}
                                            onChange={(e) => setData('company_address', e.target.value)}
                                            disabled={disabled || processing}
                                            placeholder="Masukkan alamat lengkap perusahaan/institusi"
                                        />
                                        <InputError message={errors.company_address} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Tanggal Mulai</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                                                        disabled={disabled || processing}
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
                                                        disabled={disabled || processing}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <InputError message={errors.start_date} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">Tanggal Selesai</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-start text-left font-normal ${!endDate && 'text-muted-foreground'}`}
                                                        disabled={disabled || processing}
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
                                                        disabled={disabled || processing}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <InputError message={errors.end_date} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="mt-6 flex justify-end gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Memproses...' : 'Lanjut'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="upload">
                        <Card className="shadow-md">
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="application_file">Berkas Lamaran {mode === 'create' ? '*' : ''}</Label>
                                    <Input id="application_file" type="file" accept=".pdf" disabled={disabled || processing} onChange={handleFileChange} />
                                    {currentFile && (
                                        <p className="text-sm text-muted-foreground">
                                            File saat ini: {data.application_file instanceof File ? data.application_file.name : (currentFile ? getFileName(currentFile) : 'Belum ada file dipilih.')}
                                            {mode === 'edit' && internship?.application_file && !data.application_file && (
                                                <a
                                                    href={route('front.internships.applicants.download', internship.id)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    (Unduh)
                                                </a>
                                            )}
                                        </p>
                                    )}
                                    <InputError message={errors.application_file} />
                                </div>
                                <p>Bagian Unggah Berkas.</p>
                            </CardContent>
                        </Card>
                        <div className="mt-6 flex justify-between gap-4">
                            <Button type="button" variant="outline" onClick={handlePreviousTab} disabled={processing}>
                                Kembali
                            </Button>
                            <Button type="button" onClick={handleNextTab} disabled={processing}>
                                Lanjut
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="confirm">
                        <Card className="shadow-md">
                            <CardContent className="space-y-5 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ringkasan Pengajuan</h3>
                                <div className="mt-4 space-y-3 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Nama Mahasiswa:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{studentName}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">NIM Mahasiswa:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{studentNim}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Program dipilih:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {internshipTypes.find(it => it.value === data.type)?.label || data.type}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Nama Perusahaan/Institusi:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{data.company_name}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Alamat Perusahaan/Institusi:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">{data.company_address}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Tanggal Mulai:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {data.start_date ? new Date(data.start_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Tanggal Selesai:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {data.end_date ? new Date(data.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Berkas Lamaran:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                            {data.application_file instanceof File
                                                ? data.application_file.name
                                                : mode === 'edit' && internship?.application_file
                                                    ? `${getFileName(internship.application_file)} (Berkas lama akan dipertahankan jika tidak ada perubahan)`
                                                    : 'Tidak ada berkas dipilih.'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-6 flex justify-between gap-4">
                            <Button type="button" variant="outline" onClick={handlePreviousTab} disabled={processing}>
                                Kembali
                            </Button>
                            <Button type="button" onClick={onSubmit} disabled={processing || disabled}>
                                {processing ? 'Memproses...' : 'Submit Aplikasi'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
